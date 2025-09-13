"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  ExternalLink,
  Clock,
  Package,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

interface SumUpConfig {
  clientId: string
  clientSecret: string
  isConnected: boolean
  accessToken?: string
  refreshToken?: string
  lastSync?: string
  autoSync: boolean
  syncInterval: number // en minutes
}

interface SyncStats {
  productsCount: number
  transactionsCount: number
  lastSyncDate?: string
  isLoading: boolean
}

export function SumUpIntegration() {
  const [config, setConfig] = useState<SumUpConfig>({
    clientId: "",
    clientSecret: "",
    isConnected: false,
    autoSync: false,
    syncInterval: 60, // 1 heure par défaut
  })

  const [syncStats, setSyncStats] = useState<SyncStats>({
    productsCount: 0,
    transactionsCount: 0,
    isLoading: false,
  })

  const [isConfiguring, setIsConfiguring] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Charger la configuration au montage
  useEffect(() => {
    const savedConfig = localStorage.getItem("sumup-config")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }

    const savedStats = localStorage.getItem("sumup-stats")
    if (savedStats) {
      setSyncStats(JSON.parse(savedStats))
    }
  }, [])

  // Sauvegarder la configuration
  const saveConfig = (newConfig: SumUpConfig) => {
    setConfig(newConfig)
    localStorage.setItem("sumup-config", JSON.stringify(newConfig))
  }

  // Connexion OAuth avec SumUp
  const handleConnect = async () => {
    if (!config.clientId || !config.clientSecret) {
      setError("Veuillez renseigner vos identifiants SumUp")
      return
    }

    setIsConfiguring(true)
    setError("")

    try {
      // Redirection vers l'OAuth SumUp
      const redirectUri = `${window.location.origin}/api/sumup/callback`
      const scope = "transactions.history payments user.app-settings user.profile_readonly"

      const authUrl =
        `https://api.sumup.com/authorize?` +
        `response_type=code&` +
        `client_id=${config.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}`

      // Simuler la connexion pour la démo
      setTimeout(() => {
        const newConfig = {
          ...config,
          isConnected: true,
          accessToken: "demo_access_token",
          refreshToken: "demo_refresh_token",
          lastSync: new Date().toISOString(),
        }
        saveConfig(newConfig)
        setSuccess("Connexion SumUp réussie !")
        setIsConfiguring(false)
      }, 2000)

      // En production, rediriger vers l'URL OAuth
      // window.location.href = authUrl
    } catch (err) {
      setError("Erreur lors de la connexion à SumUp")
      setIsConfiguring(false)
    }
  }

  // Déconnexion
  const handleDisconnect = () => {
    const newConfig = {
      ...config,
      isConnected: false,
      accessToken: undefined,
      refreshToken: undefined,
    }
    saveConfig(newConfig)
    setSuccess("Déconnexion réussie")
  }

  // Synchronisation manuelle
  const handleManualSync = async () => {
    if (!config.isConnected) {
      setError("Veuillez vous connecter à SumUp d'abord")
      return
    }

    setSyncStats((prev) => ({ ...prev, isLoading: true }))
    setError("")

    try {
      // Simuler la synchronisation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const newStats = {
        productsCount: Math.floor(Math.random() * 50) + 10,
        transactionsCount: Math.floor(Math.random() * 200) + 50,
        lastSyncDate: new Date().toISOString(),
        isLoading: false,
      }

      setSyncStats(newStats)
      localStorage.setItem("sumup-stats", JSON.stringify(newStats))

      const newConfig = {
        ...config,
        lastSync: new Date().toISOString(),
      }
      saveConfig(newConfig)

      setSuccess("Synchronisation terminée avec succès !")
    } catch (err) {
      setError("Erreur lors de la synchronisation")
      setSyncStats((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Activer/désactiver la synchronisation automatique
  const toggleAutoSync = (enabled: boolean) => {
    const newConfig = { ...config, autoSync: enabled }
    saveConfig(newConfig)

    if (enabled) {
      setSuccess("Synchronisation automatique activée")
    } else {
      setSuccess("Synchronisation automatique désactivée")
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Zap className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-black">Intégration SumUp</h2>
          <p className="text-sm text-gray-600">Synchronisez automatiquement vos produits et ventes depuis SumUp</p>
        </div>
      </div>

      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Settings className="h-5 w-5" />
            Statut de la connexion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {config.isConnected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-black">Connecté à SumUp</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-black">Non connecté</span>
                </>
              )}
            </div>
            <Badge variant={config.isConnected ? "default" : "secondary"}>
              {config.isConnected ? "Actif" : "Inactif"}
            </Badge>
          </div>

          {config.lastSync && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Dernière synchronisation : {new Date(config.lastSync).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      {!config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Configuration SumUp</CardTitle>
            <CardDescription className="text-black">
              Configurez vos identifiants d'application SumUp pour activer l'intégration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-black">
                Client ID
              </Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Votre Client ID SumUp"
                value={config.clientId}
                onChange={(e) => setConfig((prev) => ({ ...prev, clientId: e.target.value }))}
                className="text-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret" className="text-black">
                Client Secret
              </Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Votre Client Secret SumUp"
                value={config.clientSecret}
                onChange={(e) => setConfig((prev) => ({ ...prev, clientSecret: e.target.value }))}
                className="text-black"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-black">
                Pour obtenir vos identifiants, créez une application sur{" "}
                <a
                  href="https://developer.sumup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  developer.sumup.com
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleConnect}
              disabled={isConfiguring || !config.clientId || !config.clientSecret}
              className="w-full"
            >
              {isConfiguring ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Se connecter à SumUp
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tableau de bord de synchronisation */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Tableau de bord</CardTitle>
            <CardDescription className="text-black">Statistiques et contrôles de synchronisation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{syncStats.productsCount}</div>
                  <div className="text-sm text-gray-600">Produits synchronisés</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-black">{syncStats.transactionsCount}</div>
                  <div className="text-sm text-gray-600">Ventes ce mois</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Synchronisation manuelle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-black">Synchronisation manuelle</h4>
                  <p className="text-sm text-gray-600">Synchroniser maintenant les données SumUp</p>
                </div>
                <Button onClick={handleManualSync} disabled={syncStats.isLoading} variant="outline">
                  {syncStats.isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Synchronisation...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Synchroniser
                    </>
                  )}
                </Button>
              </div>

              {syncStats.isLoading && (
                <div className="space-y-2">
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-gray-600">Récupération des données en cours...</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Synchronisation automatique */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-black">Synchronisation automatique</h4>
                  <p className="text-sm text-gray-600">Synchroniser automatiquement à intervalles réguliers</p>
                </div>
                <Switch checked={config.autoSync} onCheckedChange={toggleAutoSync} />
              </div>

              {config.autoSync && (
                <div className="space-y-2">
                  <Label htmlFor="syncInterval" className="text-black">
                    Intervalle de synchronisation
                  </Label>
                  <Select
                    value={config.syncInterval.toString()}
                    onValueChange={(value) => {
                      const newConfig = { ...config, syncInterval: Number.parseInt(value) }
                      saveConfig(newConfig)
                    }}
                  >
                    <SelectTrigger>
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

            <Separator />

            {/* Déconnexion */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-black">Déconnexion</h4>
                <p className="text-sm text-gray-600">Se déconnecter de SumUp</p>
              </div>
              <Button variant="destructive" onClick={handleDisconnect}>
                Se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages d'état */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-black">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-black">{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
