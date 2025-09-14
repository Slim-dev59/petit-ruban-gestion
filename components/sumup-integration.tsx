"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  Clock,
  TrendingUp,
  ShoppingCart,
  CreditCard,
} from "lucide-react"

interface SumUpConfig {
  clientId: string
  clientSecret: string
  accessToken: string
  refreshToken: string
  isConnected: boolean
  autoSync: boolean
  syncInterval: number // en minutes
  lastSync: string | null
}

interface SyncStats {
  productsCount: number
  transactionsCount: number
  lastSyncDate: string | null
  isLoading: boolean
  progress: number
}

export function SumUpIntegration() {
  const [config, setConfig] = useState<SumUpConfig>({
    clientId: "",
    clientSecret: "",
    accessToken: "",
    refreshToken: "",
    isConnected: false,
    autoSync: false,
    syncInterval: 60, // 1 heure par défaut
    lastSync: null,
  })

  const [stats, setStats] = useState<SyncStats>({
    productsCount: 0,
    transactionsCount: 0,
    lastSyncDate: null,
    isLoading: false,
    progress: 0,
  })

  const [showCredentials, setShowCredentials] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Charger la configuration depuis localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("sumup-config")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    const savedStats = localStorage.getItem("sumup-stats")
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  // Sauvegarder la configuration
  const saveConfig = (newConfig: SumUpConfig) => {
    setConfig(newConfig)
    localStorage.setItem("sumup-config", JSON.stringify(newConfig))
  }

  // Sauvegarder les statistiques
  const saveStats = (newStats: SyncStats) => {
    setStats(newStats)
    localStorage.setItem("sumup-stats", JSON.stringify(newStats))
  }

  // Afficher une notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Connexion OAuth avec SumUp
  const handleOAuthConnect = () => {
    if (!config.clientId) {
      showNotification("error", "Veuillez d'abord configurer votre Client ID")
      return
    }

    const redirectUri = `${window.location.origin}/api/sumup/callback`
    const scope = "payments transactions.history products"
    const state = Math.random().toString(36).substring(7)

    const authUrl = `https://api.sumup.com/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`

    // Ouvrir la fenêtre d'autorisation
    const popup = window.open(authUrl, "sumup-auth", "width=600,height=700")

    // Écouter le message de retour
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === "SUMUP_AUTH_SUCCESS") {
        const { code } = event.data
        exchangeCodeForToken(code)
        popup?.close()
        window.removeEventListener("message", handleMessage)
      } else if (event.data.type === "SUMUP_AUTH_ERROR") {
        showNotification("error", "Erreur lors de l'autorisation SumUp")
        popup?.close()
        window.removeEventListener("message", handleMessage)
      }
    }

    window.addEventListener("message", handleMessage)
  }

  // Échanger le code d'autorisation contre un token
  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch("/api/sumup/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newConfig = {
          ...config,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isConnected: true,
        }
        saveConfig(newConfig)
        showNotification("success", "Connexion SumUp réussie !")

        // Lancer une première synchronisation
        syncData()
      } else {
        showNotification("error", data.error || "Erreur lors de l'échange du token")
      }
    } catch (error) {
      showNotification("error", "Erreur de connexion au serveur")
    }
  }

  // Synchroniser les données
  const syncData = async () => {
    if (!config.isConnected) {
      showNotification("error", "Veuillez d'abord vous connecter à SumUp")
      return
    }

    setStats((prev) => ({ ...prev, isLoading: true, progress: 0 }))

    try {
      // Synchroniser les produits
      setStats((prev) => ({ ...prev, progress: 25 }))
      const productsResponse = await fetch("/api/sumup/products", {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      })
      const productsData = await productsResponse.json()

      // Synchroniser les transactions
      setStats((prev) => ({ ...prev, progress: 75 }))
      const transactionsResponse = await fetch("/api/sumup/transactions", {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      })
      const transactionsData = await transactionsResponse.json()

      setStats((prev) => ({ ...prev, progress: 100 }))

      if (productsData.success && transactionsData.success) {
        const newStats = {
          productsCount: productsData.products?.length || 0,
          transactionsCount: transactionsData.transactions?.length || 0,
          lastSyncDate: new Date().toISOString(),
          isLoading: false,
          progress: 100,
        }
        saveStats(newStats)

        // Sauvegarder les données dans le store local
        if (productsData.products) {
          localStorage.setItem("sumup-products", JSON.stringify(productsData.products))
        }
        if (transactionsData.transactions) {
          localStorage.setItem("sumup-transactions", JSON.stringify(transactionsData.transactions))
        }

        showNotification(
          "success",
          `Synchronisation réussie ! ${newStats.productsCount} produits et ${newStats.transactionsCount} transactions importés.`,
        )
      } else {
        throw new Error("Erreur lors de la synchronisation")
      }
    } catch (error) {
      setStats((prev) => ({ ...prev, isLoading: false, progress: 0 }))
      showNotification("error", "Erreur lors de la synchronisation des données")
    }
  }

  // Déconnecter SumUp
  const handleDisconnect = () => {
    if (confirm("Êtes-vous sûr de vouloir déconnecter SumUp ?")) {
      const newConfig = {
        ...config,
        accessToken: "",
        refreshToken: "",
        isConnected: false,
        autoSync: false,
      }
      saveConfig(newConfig)

      // Nettoyer les données
      localStorage.removeItem("sumup-products")
      localStorage.removeItem("sumup-transactions")

      showNotification("success", "Déconnexion SumUp réussie")
    }
  }

  // Configuration de la synchronisation automatique
  useEffect(() => {
    if (!config.autoSync || !config.isConnected) return

    const interval = setInterval(
      () => {
        syncData()
      },
      config.syncInterval * 60 * 1000,
    ) // Convertir en millisecondes

    return () => clearInterval(interval)
  }, [config.autoSync, config.syncInterval, config.isConnected])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Intégration SumUp</h2>
        <p className="text-slate-600 mt-1">Synchronisez automatiquement vos produits et ventes depuis SumUp</p>
      </div>

      {notification && (
        <Alert variant={notification.type === "error" ? "destructive" : "default"}>
          {notification.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Statut de connexion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <div>
                <p className="font-medium text-slate-900">{config.isConnected ? "Connecté à SumUp" : "Non connecté"}</p>
                {config.isConnected && stats.lastSyncDate && (
                  <p className="text-sm text-slate-600">
                    Dernière sync: {new Date(stats.lastSyncDate).toLocaleString("fr-FR")}
                  </p>
                )}
              </div>
            </div>
            <Badge variant={config.isConnected ? "default" : "secondary"}>
              {config.isConnected ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>Configurez vos identifiants SumUp pour activer la synchronisation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-id" className="text-slate-900">
                Client ID
              </Label>
              <Input
                id="client-id"
                type={showCredentials ? "text" : "password"}
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                placeholder="Votre Client ID SumUp"
                className="text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-secret" className="text-slate-900">
                Client Secret
              </Label>
              <Input
                id="client-secret"
                type={showCredentials ? "text" : "password"}
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                placeholder="Votre Client Secret SumUp"
                className="text-slate-900"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="show-credentials" checked={showCredentials} onCheckedChange={setShowCredentials} />
              <Label htmlFor="show-credentials" className="text-slate-900">
                Afficher les identifiants
              </Label>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            {!config.isConnected ? (
              <Button
                onClick={handleOAuthConnect}
                disabled={!config.clientId || !config.clientSecret}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Se connecter à SumUp
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="flex items-center gap-2 text-slate-900 bg-transparent"
              >
                Déconnecter
              </Button>
            )}

            <Button
              onClick={() => saveConfig(config)}
              variant="outline"
              className="flex items-center gap-2 text-slate-900"
            >
              Sauvegarder
            </Button>
          </div>

          <Alert>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription className="text-slate-900">
              <strong>Besoin d'aide ?</strong> Consultez la{" "}
              <a
                href="https://developer.sumup.com/docs/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                documentation SumUp
              </a>{" "}
              pour créer votre application et obtenir vos identifiants.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Synchronisation */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Synchronisation
            </CardTitle>
            <CardDescription>Gérez la synchronisation de vos données SumUp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Synchronisation manuelle */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Synchronisation manuelle</h4>
                  <p className="text-sm text-slate-600">Lancez une synchronisation immédiate</p>
                </div>
                <Button onClick={syncData} disabled={stats.isLoading} className="flex items-center gap-2">
                  <RefreshCw className={`h-4 w-4 ${stats.isLoading ? "animate-spin" : ""}`} />
                  {stats.isLoading ? "Synchronisation..." : "Synchroniser"}
                </Button>
              </div>

              {stats.isLoading && (
                <div className="space-y-2">
                  <Progress value={stats.progress} className="w-full" />
                  <p className="text-sm text-slate-600 text-center">{stats.progress}% terminé</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Synchronisation automatique */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">Synchronisation automatique</h4>
                  <p className="text-sm text-slate-600">Synchronisez automatiquement à intervalles réguliers</p>
                </div>
                <Switch
                  checked={config.autoSync}
                  onCheckedChange={(checked) => {
                    const newConfig = { ...config, autoSync: checked }
                    saveConfig(newConfig)
                  }}
                />
              </div>

              {config.autoSync && (
                <div className="space-y-2">
                  <Label htmlFor="sync-interval" className="text-slate-900">
                    Intervalle de synchronisation
                  </Label>
                  <Select
                    value={config.syncInterval.toString()}
                    onValueChange={(value) => {
                      const newConfig = { ...config, syncInterval: Number.parseInt(value) }
                      saveConfig(newConfig)
                    }}
                  >
                    <SelectTrigger className="text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Toutes les 15 minutes</SelectItem>
                      <SelectItem value="30">Toutes les 30 minutes</SelectItem>
                      <SelectItem value="60">Toutes les heures</SelectItem>
                      <SelectItem value="180">Toutes les 3 heures</SelectItem>
                      <SelectItem value="360">Toutes les 6 heures</SelectItem>
                      <SelectItem value="720">Toutes les 12 heures</SelectItem>
                      <SelectItem value="1440">Tous les jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistiques de synchronisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.productsCount}</p>
                  <p className="text-sm text-slate-600">Produits synchronisés</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.transactionsCount}</p>
                  <p className="text-sm text-slate-600">Ventes du mois</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {stats.lastSyncDate ? new Date(stats.lastSyncDate).toLocaleDateString("fr-FR") : "Jamais"}
                  </p>
                  <p className="text-sm text-slate-600">Dernière sync</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
