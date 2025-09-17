"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import {
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Settings,
  Download,
  Clock,
  Package,
  CreditCard,
  AlertCircle,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"

interface SyncStats {
  products: number
  transactions: number
  lastSync: string
  isLoading: boolean
  progress: number
}

export function SumUpIntegration() {
  const { settings, updateSettings } = useStore()

  // États locaux pour la configuration
  const [clientId, setClientId] = useState(settings.sumupClientId || "")
  const [clientSecret, setClientSecret] = useState(settings.sumupClientSecret || "")
  const [showCredentials, setShowCredentials] = useState(false)
  const [autoSync, setAutoSync] = useState(settings.sumupAutoSync || false)
  const [syncInterval, setSyncInterval] = useState(settings.sumupSyncInterval || 60)

  const [syncStats, setSyncStats] = useState<SyncStats>({
    products: 0,
    transactions: 0,
    lastSync: settings.sumupLastSync || "",
    isLoading: false,
    progress: 0,
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  // Charger les données au démarrage
  useEffect(() => {
    console.log("🔄 Chargement des paramètres SumUp:", settings)
    setClientId(settings.sumupClientId || "")
    setClientSecret(settings.sumupClientSecret || "")
    setAutoSync(settings.sumupAutoSync || false)
    setSyncInterval(settings.sumupSyncInterval || 60)
  }, [settings])

  // Sauvegarder la configuration
  const saveConfig = () => {
    console.log("💾 Sauvegarde de la configuration SumUp:", {
      clientId,
      clientSecret: clientSecret ? "***" : "",
      autoSync,
      syncInterval,
    })

    updateSettings({
      sumupClientId: clientId,
      sumupClientSecret: clientSecret,
      sumupAutoSync: autoSync,
      sumupSyncInterval: syncInterval,
    })

    setSuccess("Configuration SumUp sauvegardée avec succès !")
    setTimeout(() => setSuccess(""), 3000)
  }

  // Vérifier si connecté
  const isConnected = !!settings.sumupAccessToken

  // Connexion OAuth SumUp
  const connectToSumUp = () => {
    if (!clientId.trim()) {
      setError("Veuillez d'abord saisir et sauvegarder votre Client ID")
      return
    }

    if (!clientSecret.trim()) {
      setError("Veuillez d'abord saisir et sauvegarder votre Client Secret")
      return
    }

    setIsConnecting(true)
    setError("")

    const redirectUri = `https://gestion.petit-ruban.fr/api/sumup/callback`
    const scope = "transactions.history payments user.app-settings user.profile_readonly"
    const state = Math.random().toString(36).substring(7)

    const authUrl = `https://api.sumup.com/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`

    console.log("🔄 Ouverture de la popup SumUp:", {
      clientId,
      redirectUri,
      scope,
      state,
    })

    // Ouvrir popup pour l'autorisation
    const popup = window.open(
      authUrl,
      "sumup-auth",
      "width=600,height=700,scrollbars=yes,resizable=yes,left=" +
        (window.screen.width / 2 - 300) +
        ",top=" +
        (window.screen.height / 2 - 350),
    )

    if (!popup) {
      setError("Impossible d'ouvrir la popup. Vérifiez que les popups ne sont pas bloquées.")
      setIsConnecting(false)
      return
    }

    // Écouter le message de callback
    const handleMessage = async (event: MessageEvent) => {
      console.log("📨 Message reçu:", event.data)

      if (event.origin !== window.location.origin) {
        console.warn("⚠️ Message ignoré - origine différente:", event.origin)
        return
      }

      if (event.data.type === "SUMUP_AUTH_SUCCESS") {
        popup?.close()
        const { code } = event.data
        console.log("✅ Code d'autorisation reçu:", code)

        try {
          // Échanger le code contre un access token
          const requestId = `exchange-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

          console.log("🔄 Échange du code pour un token...")
          const response = await fetch("/api/sumup/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": requestId,
            },
            body: JSON.stringify({
              code,
              clientId,
              clientSecret,
            }),
          })

          const data = await response.json()
          console.log("📥 Réponse token:", data)

          if (data.success) {
            // Sauvegarder les tokens
            updateSettings({
              sumupAccessToken: data.accessToken,
              sumupRefreshToken: data.refreshToken,
              sumupLastSync: new Date().toISOString(),
            })

            setSuccess("Connexion à SumUp réussie !")
            setError("")

            // Lancer une première synchronisation
            setTimeout(() => syncData(data.accessToken), 1000)
          } else {
            setError(data.error || "Erreur lors de la connexion")
          }
        } catch (err) {
          console.error("❌ Erreur échange token:", err)
          setError("Erreur lors de l'échange du token")
        } finally {
          setIsConnecting(false)
        }
      } else if (event.data.type === "SUMUP_AUTH_ERROR") {
        popup?.close()
        console.error("❌ Erreur OAuth:", event.data.error, event.data.errorDescription)
        setError(event.data.errorDescription || event.data.error || "Erreur d'autorisation")
        setIsConnecting(false)
      }
    }

    window.addEventListener("message", handleMessage)

    // Nettoyer l'écouteur si la popup est fermée manuellement
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        console.log("🔄 Popup fermée manuellement")
        window.removeEventListener("message", handleMessage)
        clearInterval(checkClosed)
        setIsConnecting(false)
      }
    }, 1000)

    // Timeout après 5 minutes
    setTimeout(
      () => {
        if (!popup?.closed) {
          popup?.close()
          window.removeEventListener("message", handleMessage)
          clearInterval(checkClosed)
          setError("Timeout - Connexion annulée")
          setIsConnecting(false)
        }
      },
      5 * 60 * 1000,
    )
  }

  // Déconnexion
  const disconnect = () => {
    if (confirm("Êtes-vous sûr de vouloir déconnecter SumUp ?")) {
      updateSettings({
        sumupAccessToken: "",
        sumupRefreshToken: "",
        sumupLastSync: "",
      })
      setSuccess("Déconnecté de SumUp")
      setSyncStats((prev) => ({ ...prev, products: 0, transactions: 0, lastSync: "" }))
    }
  }

  // Synchronisation manuelle
  const syncData = async (token?: string) => {
    const accessToken = token || settings.sumupAccessToken
    if (!accessToken) {
      setError("Pas de token d'accès disponible")
      return
    }

    setSyncStats((prev) => ({ ...prev, isLoading: true, progress: 0 }))
    setError("")

    try {
      console.log("🔄 Début de la synchronisation...")

      // Synchroniser les produits
      setSyncStats((prev) => ({ ...prev, progress: 25 }))
      const requestId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const productsResponse = await fetch("/api/sumup/products", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Request-ID": requestId,
        },
      })
      const productsData = await productsResponse.json()
      console.log("📦 Produits:", productsData)

      // Synchroniser les transactions
      setSyncStats((prev) => ({ ...prev, progress: 75 }))
      const transactionsResponse = await fetch("/api/sumup/transactions", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Request-ID": requestId,
        },
      })
      const transactionsData = await transactionsResponse.json()
      console.log("💳 Transactions:", transactionsData)

      setSyncStats((prev) => ({ ...prev, progress: 100 }))

      if (productsData.success && transactionsData.success) {
        const now = new Date().toISOString()
        const newStats = {
          products: productsData.products?.length || 0,
          transactions: transactionsData.transactions?.length || 0,
          lastSync: now,
          isLoading: false,
          progress: 100,
        }

        setSyncStats(newStats)

        // Sauvegarder la date de dernière sync
        updateSettings({ sumupLastSync: now })

        setSuccess(
          `Synchronisation réussie ! ${newStats.products} produits et ${newStats.transactions} transactions importés.`,
        )

        // Sauvegarder les données localement
        if (productsData.products) {
          localStorage.setItem("sumup-products", JSON.stringify(productsData.products))
        }
        if (transactionsData.transactions) {
          localStorage.setItem("sumup-transactions", JSON.stringify(transactionsData.transactions))
        }
      } else {
        throw new Error(productsData.error || transactionsData.error || "Erreur lors de la synchronisation")
      }
    } catch (err) {
      console.error("❌ Erreur synchronisation:", err)
      setError("Erreur lors de la synchronisation des données")
      setSyncStats((prev) => ({ ...prev, isLoading: false, progress: 0 }))
    }
  }

  // Synchronisation automatique
  useEffect(() => {
    if (!autoSync || !isConnected) return

    console.log(`🔄 Synchronisation automatique activée (${syncInterval} min)`)
    const interval = setInterval(
      () => {
        console.log("🔄 Synchronisation automatique...")
        syncData()
      },
      syncInterval * 60 * 1000,
    )

    return () => {
      console.log("🔄 Synchronisation automatique désactivée")
      clearInterval(interval)
    }
  }, [autoSync, isConnected, syncInterval])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Intégration SumUp</h3>
          <p className="text-sm text-muted-foreground">
            Synchronisez automatiquement vos produits et transactions SumUp
          </p>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
          {isConnected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {isConnected ? "Connecté" : "Déconnecté"}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration API
          </CardTitle>
          <CardDescription>Configurez vos identifiants SumUp pour activer l'intégration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID SumUp</Label>
              <Input
                id="clientId"
                type={showCredentials ? "text" : "password"}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="sum_xxxxxxxxxxxxxxxxx"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Votre Client ID commence par "sum_"</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret SumUp</Label>
              <Input
                id="clientSecret"
                type={showCredentials ? "text" : "password"}
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Votre Client Secret SumUp"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Gardez votre Client Secret confidentiel</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-credentials" checked={showCredentials} onCheckedChange={setShowCredentials} />
              <Label htmlFor="show-credentials" className="text-sm">
                {showCredentials ? (
                  <>
                    <EyeOff className="h-4 w-4 inline mr-1" />
                    Masquer les identifiants
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 inline mr-1" />
                    Afficher les identifiants
                  </>
                )}
              </Label>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Synchronisation automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Synchroniser automatiquement les données à intervalles réguliers
                </p>
              </div>
              <Switch checked={autoSync} onCheckedChange={setAutoSync} />
            </div>

            {autoSync && (
              <div className="space-y-2">
                <Label>Intervalle de synchronisation</Label>
                <Select
                  value={syncInterval.toString()}
                  onValueChange={(value) => setSyncInterval(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Toutes les 15 minutes</SelectItem>
                    <SelectItem value="30">Toutes les 30 minutes</SelectItem>
                    <SelectItem value="60">Toutes les heures</SelectItem>
                    <SelectItem value="240">Toutes les 4 heures</SelectItem>
                    <SelectItem value="1440">Tous les jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={saveConfig} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder la configuration
            </Button>
            <Button asChild variant="outline">
              <a href="https://developer.sumup.com/docs/register-app" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Guide SumUp
              </a>
            </Button>
          </div>

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>Étapes :</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>
                  Créez une application sur{" "}
                  <a href="https://developer.sumup.com" target="_blank" rel="noopener noreferrer" className="underline">
                    developer.sumup.com
                  </a>
                </li>
                <li>Copiez votre Client ID et Client Secret ci-dessus</li>
                <li>
                  Configurez l'URL de redirection :{" "}
                  <code className="bg-muted px-1 rounded">https://gestion.petit-ruban.fr/api/sumup/callback</code>
                </li>
                <li>Cliquez sur "Sauvegarder la configuration"</li>
                <li>Puis sur "Se connecter à SumUp"</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Connexion SumUp
          </CardTitle>
          <CardDescription>Autorisez l'accès à votre compte SumUp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <Button
              onClick={connectToSumUp}
              disabled={!clientId.trim() || !clientSecret.trim() || isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Se connecter à SumUp
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Connecté à SumUp</span>
                </div>
                <Button onClick={disconnect} variant="outline" size="sm">
                  Déconnecter
                </Button>
              </div>
            </div>
          )}

          {!clientId.trim() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Veuillez d'abord saisir et sauvegarder votre Client ID</AlertDescription>
            </Alert>
          )}

          {!clientSecret.trim() && clientId.trim() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Veuillez d'abord saisir et sauvegarder votre Client Secret</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Synchronisation */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Synchronisation
            </CardTitle>
            <CardDescription>Gérez la synchronisation de vos données SumUp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Produits</span>
                </div>
                <div className="text-2xl font-bold">{syncStats.products}</div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Transactions</span>
                </div>
                <div className="text-2xl font-bold">{syncStats.transactions}</div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Dernière sync</span>
                </div>
                <div className="text-sm">
                  {syncStats.lastSync ? new Date(syncStats.lastSync).toLocaleString("fr-FR") : "Jamais"}
                </div>
              </Card>
            </div>

            {/* Barre de progression */}
            {syncStats.isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Synchronisation en cours...</span>
                  <span className="text-sm text-muted-foreground">{syncStats.progress}%</span>
                </div>
                <Progress value={syncStats.progress} className="w-full" />
              </div>
            )}

            <Button onClick={() => syncData()} disabled={syncStats.isLoading} className="w-full">
              {syncStats.isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {syncStats.isLoading ? "Synchronisation..." : "Synchroniser maintenant"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
