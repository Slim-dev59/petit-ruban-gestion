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
} from "lucide-react"

interface SumUpConfig {
  clientId: string
  clientSecret: string
  accessToken?: string
  refreshToken?: string
  isConnected: boolean
  lastSync?: string
  autoSync: boolean
  syncInterval: number // en minutes
}

interface SyncStats {
  products: number
  transactions: number
  lastSync: string
  isLoading: boolean
  progress: number
}

export function SumUpIntegration() {
  const { settings, updateSettings } = useStore()
  const [config, setConfig] = useState<SumUpConfig>({
    clientId: settings.sumupClientId || "",
    clientSecret: settings.sumupClientSecret || "",
    accessToken: settings.sumupAccessToken,
    refreshToken: settings.sumupRefreshToken,
    isConnected: !!settings.sumupAccessToken,
    lastSync: settings.sumupLastSync,
    autoSync: settings.sumupAutoSync || false,
    syncInterval: settings.sumupSyncInterval || 60,
  })

  const [syncStats, setSyncStats] = useState<SyncStats>({
    products: 0,
    transactions: 0,
    lastSync: config.lastSync || "",
    isLoading: false,
    progress: 0,
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Sauvegarder la configuration
  const saveConfig = () => {
    updateSettings({
      sumupClientId: config.clientId,
      sumupClientSecret: config.clientSecret,
      sumupAccessToken: config.accessToken,
      sumupRefreshToken: config.refreshToken,
      sumupLastSync: config.lastSync,
      sumupAutoSync: config.autoSync,
      sumupSyncInterval: config.syncInterval,
    })
    setSuccess("Configuration SumUp sauvegardée")
    setTimeout(() => setSuccess(""), 3000)
  }

  // Connexion OAuth SumUp
  const connectToSumUp = () => {
    if (!config.clientId) {
      setError("Veuillez d'abord configurer votre Client ID")
      return
    }

    const redirectUri = `${window.location.origin}/api/sumup/callback`
    const scope = "transactions.history payments user.app-settings user.profile_readonly"
    const state = Math.random().toString(36).substring(7)

    const authUrl = `https://api.sumup.com/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`

    // Ouvrir popup pour l'autorisation
    const popup = window.open(authUrl, "sumup-auth", "width=600,height=700,scrollbars=yes,resizable=yes")

    // Écouter le message de callback
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return

      if (event.data.type === "SUMUP_AUTH_SUCCESS") {
        popup?.close()
        const { code } = event.data

        try {
          // Échanger le code contre un access token
          const response = await fetch("/api/sumup/token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              clientId: config.clientId,
              clientSecret: config.clientSecret,
              redirectUri,
            }),
          })

          const data = await response.json()

          if (data.success) {
            setConfig((prev) => ({
              ...prev,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              isConnected: true,
            }))
            setSuccess("Connexion à SumUp réussie !")
            setError("")
          } else {
            setError(data.error || "Erreur lors de la connexion")
          }
        } catch (err) {
          setError("Erreur lors de l'échange du token")
        }
      } else if (event.data.type === "SUMUP_AUTH_ERROR") {
        popup?.close()
        setError(event.data.error || "Erreur d'autorisation")
      }
    }

    window.addEventListener("message", handleMessage)

    // Nettoyer l'écouteur si la popup est fermée manuellement
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        window.removeEventListener("message", handleMessage)
        clearInterval(checkClosed)
      }
    }, 1000)
  }

  // Déconnexion
  const disconnect = () => {
    setConfig((prev) => ({
      ...prev,
      accessToken: undefined,
      refreshToken: undefined,
      isConnected: false,
    }))
    setSuccess("Déconnecté de SumUp")
  }

  // Synchronisation manuelle
  const syncData = async () => {
    if (!config.accessToken) {
      setError("Pas de token d'accès disponible")
      return
    }

    setSyncStats((prev) => ({ ...prev, isLoading: true, progress: 0 }))
    setError("")

    try {
      // Synchroniser les produits
      setSyncStats((prev) => ({ ...prev, progress: 25 }))
      const productsResponse = await fetch("/api/sumup/products", {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      })
      const productsData = await productsResponse.json()

      // Synchroniser les transactions
      setSyncStats((prev) => ({ ...prev, progress: 75 }))
      const transactionsResponse = await fetch("/api/sumup/transactions", {
        headers: { Authorization: `Bearer ${config.accessToken}` },
      })
      const transactionsData = await transactionsResponse.json()

      setSyncStats((prev) => ({ ...prev, progress: 100 }))

      if (productsData.success && transactionsData.success) {
        const now = new Date().toISOString()
        setSyncStats({
          products: productsData.products?.length || 0,
          transactions: transactionsData.transactions?.length || 0,
          lastSync: now,
          isLoading: false,
          progress: 100,
        })

        setConfig((prev) => ({ ...prev, lastSync: now }))
        setSuccess(
          `Synchronisation réussie ! ${productsData.products?.length || 0} produits et ${transactionsData.transactions?.length || 0} transactions importés.`,
        )
      } else {
        throw new Error("Erreur lors de la synchronisation")
      }
    } catch (err) {
      setError("Erreur lors de la synchronisation des données")
      setSyncStats((prev) => ({ ...prev, isLoading: false, progress: 0 }))
    }
  }

  // Synchronisation automatique
  useEffect(() => {
    if (!config.autoSync || !config.isConnected) return

    const interval = setInterval(
      () => {
        syncData()
      },
      config.syncInterval * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [config.autoSync, config.isConnected, config.syncInterval])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Intégration SumUp</h3>
          <p className="text-sm text-muted-foreground">
            Synchronisez automatiquement vos produits et transactions SumUp
          </p>
        </div>
        <Badge variant={config.isConnected ? "default" : "secondary"} className="flex items-center gap-1">
          {config.isConnected ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {config.isConnected ? "Connecté" : "Déconnecté"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="text"
                value={config.clientId}
                onChange={(e) => setConfig((prev) => ({ ...prev, clientId: e.target.value }))}
                placeholder="Votre Client ID SumUp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={config.clientSecret}
                onChange={(e) => setConfig((prev) => ({ ...prev, clientSecret: e.target.value }))}
                placeholder="Votre Client Secret SumUp"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveConfig} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button asChild variant="ghost">
              <a href="https://developer.sumup.com/docs/register-app" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Guide SumUp
              </a>
            </Button>
          </div>
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
          {!config.isConnected ? (
            <Button onClick={connectToSumUp} disabled={!config.clientId} className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Se connecter à SumUp
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

            {/* Contrôles de synchronisation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Synchronisation automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Synchroniser automatiquement les données à intervalles réguliers
                  </p>
                </div>
                <Switch
                  checked={config.autoSync}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, autoSync: checked }))}
                />
              </div>

              {config.autoSync && (
                <div className="space-y-2">
                  <Label>Intervalle de synchronisation</Label>
                  <Select
                    value={config.syncInterval.toString()}
                    onValueChange={(value) => setConfig((prev) => ({ ...prev, syncInterval: Number.parseInt(value) }))}
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

              <Button onClick={syncData} disabled={syncStats.isLoading} className="w-full">
                {syncStats.isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {syncStats.isLoading ? "Synchronisation..." : "Synchroniser maintenant"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aide */}
      <Card>
        <CardHeader>
          <CardTitle>Aide et documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Pour configurer l'intégration SumUp, vous devez créer une application sur le portail développeur SumUp.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="https://developer.sumup.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Portail développeur
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="https://developer.sumup.com/docs" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Documentation API
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
