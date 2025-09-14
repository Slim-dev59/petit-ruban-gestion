"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
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
  accessToken?: string
  refreshToken?: string
  isConnected: boolean
  autoSync: boolean
  syncInterval: number // en minutes
  lastSync?: string
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

  const [stats, setStats] = useState<SyncStats>({
    productsCount: 0,
    transactionsCount: 0,
    isLoading: false,
  })

  const [isConfiguring, setIsConfiguring] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)

  // Charger la configuration au montage
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

  // Connexion OAuth avec SumUp
  const handleConnect = async () => {
    if (!config.clientId || !config.clientSecret) {
      alert("Veuillez renseigner vos identifiants SumUp")
      return
    }

    setIsConfiguring(true)

    try {
      // Simuler la connexion OAuth (en production, rediriger vers SumUp)
      const authUrl = `https://api.sumup.com/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${window.location.origin}/api/sumup/callback&scope=payments`

      // Pour la démo, simuler une connexion réussie
      setTimeout(() => {
        const newConfig = {
          ...config,
          isConnected: true,
          accessToken: "demo_access_token",
          refreshToken: "demo_refresh_token",
        }
        saveConfig(newConfig)
        setIsConfiguring(false)
      }, 2000)

      // En production, ouvrir la fenêtre OAuth
      // window.open(authUrl, '_blank', 'width=600,height=600')
    } catch (error) {
      console.error("Erreur de connexion SumUp:", error)
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
  }

  // Synchronisation manuelle
  const handleManualSync = async () => {
    if (!config.isConnected) return

    setStats((prev) => ({ ...prev, isLoading: true }))
    setSyncProgress(0)

    try {
      // Simuler la synchronisation des produits
      setSyncProgress(25)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simuler la synchronisation des transactions
      setSyncProgress(75)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSyncProgress(100)

      // Mettre à jour les statistiques
      const newStats = {
        productsCount: Math.floor(Math.random() * 50) + 10,
        transactionsCount: Math.floor(Math.random() * 200) + 50,
        lastSyncDate: new Date().toISOString(),
        isLoading: false,
      }

      setStats(newStats)
      localStorage.setItem("sumup-stats", JSON.stringify(newStats))

      const newConfig = {
        ...config,
        lastSync: new Date().toISOString(),
      }
      saveConfig(newConfig)
    } catch (error) {
      console.error("Erreur de synchronisation:", error)
    } finally {
      setTimeout(() => {
        setStats((prev) => ({ ...prev, isLoading: false }))
        setSyncProgress(0)
      }, 500)
    }
  }

  // Basculer la synchronisation automatique
  const toggleAutoSync = (enabled: boolean) => {
    const newConfig = {
      ...config,
      autoSync: enabled,
    }
    saveConfig(newConfig)
  }

  // Changer l'intervalle de synchronisation
  const changeSyncInterval = (interval: string) => {
    const newConfig = {
      ...config,
      syncInterval: Number.parseInt(interval),
    }
    saveConfig(newConfig)
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
          <p className="text-sm text-gray-600">Synchronisez automatiquement vos produits et ventes</p>
        </div>
      </div>

      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            {config.isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Statut de connexion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={config.isConnected ? "default" : "secondary"} className="text-black">
                {config.isConnected ? "Connecté" : "Déconnecté"}
              </Badge>
              {config.lastSync && (
                <p className="text-sm text-gray-600 mt-1">
                  Dernière sync: {new Date(config.lastSync).toLocaleString()}
                </p>
              )}
            </div>
            {config.isConnected ? (
              <Button variant="outline" onClick={handleDisconnect} className="text-black bg-transparent">
                Déconnecter
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={isConfiguring} className="text-white">
                {isConfiguring ? "Connexion..." : "Se connecter"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      {!config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription className="text-black">
              Configurez vos identifiants SumUp pour activer l'intégration
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
                Créez une application sur{" "}
                <a
                  href="https://developer.sumup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  developer.sumup.com
                  <ExternalLink className="h-3 w-3" />
                </a>{" "}
                pour obtenir vos identifiants.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Tableau de bord */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <TrendingUp className="h-5 w-5" />
              Tableau de bord
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-black">Produits synchronisés</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.productsCount}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-black">Ventes ce mois</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.transactionsCount}</p>
              </div>
            </div>

            {stats.isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black">Synchronisation en cours...</span>
                  <span className="text-sm text-gray-600">{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleManualSync}
                disabled={stats.isLoading}
                className="flex items-center gap-2 text-white"
              >
                <RefreshCw className={`h-4 w-4 ${stats.isLoading ? "animate-spin" : ""}`} />
                Synchroniser maintenant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Synchronisation automatique */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Clock className="h-5 w-5" />
              Synchronisation automatique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSync" className="text-black">
                  Activer la synchronisation automatique
                </Label>
                <p className="text-sm text-gray-600">Synchronise automatiquement vos données à intervalle régulier</p>
              </div>
              <Switch id="autoSync" checked={config.autoSync} onCheckedChange={toggleAutoSync} />
            </div>

            {config.autoSync && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="syncInterval" className="text-black">
                    Intervalle de synchronisation
                  </Label>
                  <Select value={config.syncInterval.toString()} onValueChange={changeSyncInterval}>
                    <SelectTrigger className="text-black">
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
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
