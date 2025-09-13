"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Zap,
  Calendar,
  Package,
  ShoppingCart,
  Settings,
  ExternalLink,
} from "lucide-react"
import { useStore } from "@/lib/store"

interface SumUpConfig {
  isConnected: boolean
  accessToken?: string
  refreshToken?: string
  merchantCode?: string
  lastSync?: string
  autoSync: boolean
  syncInterval: number // en minutes
}

export function SumUpIntegration() {
  const [config, setConfig] = useState<SumUpConfig>({
    isConnected: false,
    autoSync: false,
    syncInterval: 60,
  })
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null)
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")

  const { importStockData, importSalesData, stockData, monthlyData } = useStore()

  // Charger la configuration au montage
  useEffect(() => {
    const savedConfig = localStorage.getItem("sumup-config")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    const savedClientId = localStorage.getItem("sumup-client-id")
    const savedClientSecret = localStorage.getItem("sumup-client-secret")
    if (savedClientId) setClientId(savedClientId)
    if (savedClientSecret) setClientSecret(savedClientSecret)
  }, [])

  // Sauvegarder la configuration
  const saveConfig = (newConfig: SumUpConfig) => {
    setConfig(newConfig)
    localStorage.setItem("sumup-config", JSON.stringify(newConfig))
  }

  // Sauvegarder les credentials
  const saveCredentials = () => {
    localStorage.setItem("sumup-client-id", clientId)
    localStorage.setItem("sumup-client-secret", clientSecret)
    setSyncStatus({ type: "success", message: "Identifiants sauvegardés" })
  }

  // Initier la connexion OAuth avec SumUp
  const connectToSumUp = () => {
    if (!clientId || !clientSecret) {
      setSyncStatus({ type: "error", message: "Veuillez renseigner vos identifiants SumUp" })
      return
    }

    // URL d'autorisation SumUp
    const authUrl = `https://api.sumup.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.origin + "/sumup-callback")}&scope=payments transactions products`

    // Ouvrir dans une nouvelle fenêtre
    const authWindow = window.open(authUrl, "sumup-auth", "width=600,height=700")

    // Écouter le retour de l'autorisation
    const checkClosed = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkClosed)
        // Vérifier si on a reçu le code d'autorisation
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get("code")
        if (code) {
          exchangeCodeForToken(code)
        }
      }
    }, 1000)
  }

  // Échanger le code d'autorisation contre un token
  const exchangeCodeForToken = async (code: string) => {
    try {
      setSyncing(true)

      // Simulation de l'échange de token (en réalité, cela devrait passer par votre backend)
      const response = await fetch("/api/sumup/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: window.location.origin + "/sumup-callback",
        }),
      })

      if (response.ok) {
        const tokenData = await response.json()

        const newConfig: SumUpConfig = {
          ...config,
          isConnected: true,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          merchantCode: tokenData.merchant_code,
          lastSync: new Date().toISOString(),
        }

        saveConfig(newConfig)
        setSyncStatus({ type: "success", message: "Connexion à SumUp réussie !" })

        // Lancer une première synchronisation
        await syncData(newConfig)
      } else {
        throw new Error("Erreur lors de l'échange du token")
      }
    } catch (error) {
      setSyncStatus({ type: "error", message: "Erreur lors de la connexion à SumUp" })
    } finally {
      setSyncing(false)
    }
  }

  // Synchroniser les données depuis SumUp
  const syncData = async (configToUse = config) => {
    if (!configToUse.isConnected || !configToUse.accessToken) {
      setSyncStatus({ type: "error", message: "Non connecté à SumUp" })
      return
    }

    setSyncing(true)
    setSyncStatus({ type: "info", message: "Synchronisation en cours..." })

    try {
      // Récupérer les produits (stock)
      const productsResponse = await fetch("/api/sumup/products", {
        headers: {
          Authorization: `Bearer ${configToUse.accessToken}`,
        },
      })

      if (productsResponse.ok) {
        const products = await productsResponse.json()

        // Transformer les produits SumUp en format local
        const stockData = products.map((product: any) => ({
          createur: product.category || "Non catégorisé",
          article: product.name,
          price: product.price?.toString() || "0",
          quantity: product.quantity?.toString() || "0",
          category: product.category || "",
          sku: product.sku || "",
          image: product.image_url || "",
        }))

        importStockData(stockData)

        setSyncStatus({
          type: "success",
          message: `✅ ${stockData.length} produits synchronisés depuis SumUp`,
        })
      }

      // Récupérer les transactions (ventes)
      const transactionsResponse = await fetch("/api/sumup/transactions", {
        headers: {
          Authorization: `Bearer ${configToUse.accessToken}`,
        },
      })

      if (transactionsResponse.ok) {
        const transactions = await transactionsResponse.json()

        // Transformer les transactions SumUp en format local
        const salesData = transactions
          .filter((tx: any) => tx.status === "SUCCESSFUL")
          .map((tx: any) => ({
            date: tx.timestamp,
            description: tx.product_summary || "Vente SumUp",
            prix: tx.amount?.toString() || "0",
            paiement: tx.payment_type || "Carte",
            createur: "À identifier",
            quantity: "1",
            commission: "0",
          }))

        // Grouper par mois et importer
        const salesByMonth = salesData.reduce((acc: any, sale: any) => {
          const month = new Date(sale.date).toISOString().slice(0, 7)
          if (!acc[month]) acc[month] = []
          acc[month].push(sale)
          return acc
        }, {})

        Object.entries(salesByMonth).forEach(([month, sales]: [string, any]) => {
          importSalesData(sales, month)
        })

        setSyncStatus({
          type: "success",
          message: `✅ Synchronisation terminée : ${stockData?.length || 0} produits, ${salesData.length} ventes`,
        })
      }

      // Mettre à jour la date de dernière sync
      const updatedConfig = {
        ...configToUse,
        lastSync: new Date().toISOString(),
      }
      saveConfig(updatedConfig)
    } catch (error) {
      console.error("Erreur de synchronisation:", error)
      setSyncStatus({ type: "error", message: "Erreur lors de la synchronisation" })
    } finally {
      setSyncing(false)
    }
  }

  // Déconnecter SumUp
  const disconnect = () => {
    const newConfig: SumUpConfig = {
      isConnected: false,
      autoSync: false,
      syncInterval: 60,
    }
    saveConfig(newConfig)
    setSyncStatus({ type: "info", message: "Déconnecté de SumUp" })
  }

  // Activer/désactiver la synchronisation automatique
  const toggleAutoSync = (enabled: boolean) => {
    const newConfig = { ...config, autoSync: enabled }
    saveConfig(newConfig)

    if (enabled) {
      setSyncStatus({
        type: "success",
        message: `Synchronisation automatique activée (toutes les ${config.syncInterval} minutes)`,
      })
    } else {
      setSyncStatus({ type: "info", message: "Synchronisation automatique désactivée" })
    }
  }

  // Effet pour la synchronisation automatique
  useEffect(() => {
    if (!config.autoSync || !config.isConnected) return

    const interval = setInterval(
      () => {
        syncData()
      },
      config.syncInterval * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [config.autoSync, config.syncInterval, config.isConnected])

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Zap className="h-5 w-5" />
            Intégration SumUp
            {config.isConnected && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connecté
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-black font-medium">
            Synchronisez automatiquement vos produits et ventes depuis votre compte SumUp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!config.isConnected ? (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Settings className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-black">
                  <strong>Configuration requise :</strong> Vous devez créer une application SumUp pour obtenir vos
                  identifiants.
                  <a
                    href="https://developer.sumup.com/docs/register-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                  >
                    Guide de configuration <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-id" className="text-black font-semibold">
                    Client ID
                  </Label>
                  <Input
                    id="client-id"
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Votre Client ID SumUp"
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-secret" className="text-black font-semibold">
                    Client Secret
                  </Label>
                  <Input
                    id="client-secret"
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="Votre Client Secret SumUp"
                    className="text-black"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={saveCredentials} variant="outline" className="text-black bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Sauvegarder les identifiants
                </Button>
                <Button onClick={connectToSumUp} disabled={!clientId || !clientSecret}>
                  <Zap className="h-4 w-4 mr-2" />
                  Se connecter à SumUp
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-black">Connecté à SumUp</div>
                  <div className="text-sm text-black">
                    Dernière synchronisation :{" "}
                    {config.lastSync ? new Date(config.lastSync).toLocaleString("fr-FR") : "Jamais"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => syncData()} disabled={syncing} size="sm">
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                    {syncing ? "Sync..." : "Synchroniser"}
                  </Button>
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    Déconnecter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-sync" className="text-black font-semibold">
                      Synchronisation automatique
                    </Label>
                    <p className="text-sm text-black">
                      Synchroniser automatiquement les données à intervalles réguliers
                    </p>
                  </div>
                  <Switch id="auto-sync" checked={config.autoSync} onCheckedChange={toggleAutoSync} />
                </div>

                {config.autoSync && (
                  <div className="space-y-2">
                    <Label htmlFor="sync-interval" className="text-black font-semibold">
                      Intervalle de synchronisation (minutes)
                    </Label>
                    <Input
                      id="sync-interval"
                      type="number"
                      min="5"
                      max="1440"
                      value={config.syncInterval}
                      onChange={(e) => {
                        const newConfig = { ...config, syncInterval: Number.parseInt(e.target.value) || 60 }
                        saveConfig(newConfig)
                      }}
                      className="w-32 text-black"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-black">Produits synchronisés</span>
                    </div>
                    <div className="text-2xl font-bold text-black mt-2">{stockData.length}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-black">Ventes ce mois</span>
                    </div>
                    <div className="text-2xl font-bold text-black mt-2">
                      {Object.values(monthlyData).reduce((total, month) => total + (month.salesData?.length || 0), 0)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-black">Prochaine sync</span>
                    </div>
                    <div className="text-sm font-bold text-black mt-2">
                      {config.autoSync ? `${config.syncInterval} min` : "Manuelle"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {syncStatus && (
            <Alert
              variant={syncStatus.type === "error" ? "destructive" : "default"}
              className="bg-white border-slate-200"
            >
              {syncStatus.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : syncStatus.type === "success" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <AlertDescription className="text-black font-medium">{syncStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
