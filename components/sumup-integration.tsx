"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Info,
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

  const [syncProgress, setSyncProgress] = useState(0)
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)

  // Charger la configuration au montage
  useEffect(() => {
    const savedConfig = localStorage.getItem("sumup-config")
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
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
      setMessage({ type: "error", text: "Veuillez renseigner le Client ID et le Client Secret" })
      return
    }

    try {
      // Redirection vers l'autorisation SumUp
      const authUrl = `https://api.sumup.com/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=${encodeURIComponent(window.location.origin + "/api/sumup/callback")}&scope=payments`

      setMessage({ type: "info", text: "Redirection vers SumUp pour l'autorisation..." })
      window.location.href = authUrl
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la connexion à SumUp" })
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
    setMessage({ type: "success", text: "Déconnecté de SumUp avec succès" })
  }

  // Synchronisation manuelle
  const handleManualSync = async () => {
    setSyncStats((prev) => ({ ...prev, isLoading: true }))
    setSyncProgress(0)
    setMessage({ type: "info", text: "Synchronisation en cours..." })

    try {
      // Simulation de la synchronisation avec progression
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(i)
        await new Promise((resolve) => setTimeout(resolve, 200))
      }

      // Appel aux API SumUp
      const [productsResponse, transactionsResponse] = await Promise.all([
        fetch("/api/sumup/products", {
          headers: { Authorization: `Bearer ${config.accessToken}` },
        }),
        fetch("/api/sumup/transactions", {
          headers: { Authorization: `Bearer ${config.accessToken}` },
        }),
      ])

      const products = await productsResponse.json()
      const transactions = await transactionsResponse.json()

      setSyncStats({
        productsCount: products.length || 0,
        transactionsCount: transactions.length || 0,
        lastSyncDate: new Date().toISOString(),
        isLoading: false,
      })

      const newConfig = {
        ...config,
        lastSync: new Date().toISOString(),
      }
      saveConfig(newConfig)

      setMessage({
        type: "success",
        text: `Synchronisation terminée: ${products.length || 0} produits, ${transactions.length || 0} transactions`,
      })
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors de la synchronisation" })
      setSyncStats((prev) => ({ ...prev, isLoading: false }))
    }

    setSyncProgress(0)
  }

  // Mise à jour de la configuration
  const updateConfig = (updates: Partial<SumUpConfig>) => {
    const newConfig = { ...config, ...updates }
    saveConfig(newConfig)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Intégration SumUp</h2>
          <p className="text-sm text-slate-600">Synchronisez automatiquement vos produits et ventes</p>
        </div>
      </div>

      {/* Message d'état */}
      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <Settings className="h-5 w-5" />
            <span>Configuration</span>
          </CardTitle>
          <CardDescription>Configurez vos identifiants SumUp pour activer l'intégration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId" className="text-slate-900">
                Client ID
              </Label>
              <Input
                id="clientId"
                type="text"
                placeholder="Votre Client ID SumUp"
                value={config.clientId}
                onChange={(e) => updateConfig({ clientId: e.target.value })}
                className="text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSecret" className="text-slate-900">
                Client Secret
              </Label>
              <Input
                id="clientSecret"
                type="password"
                placeholder="Votre Client Secret SumUp"
                value={config.clientSecret}
                onChange={(e) => updateConfig({ clientSecret: e.target.value })}
                className="text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {config.isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium text-slate-900">{config.isConnected ? "Connecté à SumUp" : "Non connecté"}</p>
                <p className="text-sm text-slate-600">
                  {config.isConnected
                    ? "L'intégration est active et fonctionnelle"
                    : "Connectez-vous pour activer l'intégration"}
                </p>
              </div>
            </div>
            {config.isConnected ? (
              <Button variant="outline" onClick={handleDisconnect}>
                Se déconnecter
              </Button>
            ) : (
              <Button onClick={handleConnect} className="bg-orange-500 hover:bg-orange-600">
                Se connecter
              </Button>
            )}
          </div>

          <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-slate-900 mb-1">Comment obtenir vos identifiants :</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>
                Créez une application sur{" "}
                <a
                  href="https://developer.sumup.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center"
                >
                  developer.sumup.com <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>Copiez le Client ID et Client Secret</li>
              <li>
                Configurez l'URL de redirection :{" "}
                <code className="bg-white px-1 rounded">{window.location.origin}/api/sumup/callback</code>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Synchronisation */}
      {config.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-slate-900">
              <RefreshCw className="h-5 w-5" />
              <span>Synchronisation</span>
            </CardTitle>
            <CardDescription>Gérez la synchronisation de vos données SumUp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">Produits synchronisés</p>
                    <p className="text-2xl font-bold text-blue-900">{syncStats.productsCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">Ventes ce mois</p>
                    <p className="text-2xl font-bold text-green-900">{syncStats.transactionsCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">Dernière sync</p>
                    <p className="text-sm font-medium text-purple-900">
                      {config.lastSync
                        ? new Date(config.lastSync).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Jamais"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barre de progression */}
            {syncStats.isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Synchronisation en cours...</span>
                  <span>{syncProgress}%</span>
                </div>
                <Progress value={syncProgress} className="h-2" />
              </div>
            )}

            <Separator />

            {/* Contrôles de synchronisation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Synchronisation automatique</p>
                  <p className="text-sm text-slate-600">
                    Synchronise automatiquement vos données à intervalle régulier
                  </p>
                </div>
                <Switch checked={config.autoSync} onCheckedChange={(checked) => updateConfig({ autoSync: checked })} />
              </div>

              {config.autoSync && (
                <div className="space-y-2">
                  <Label htmlFor="syncInterval" className="text-slate-900">
                    Intervalle de synchronisation
                  </Label>
                  <Select
                    value={config.syncInterval.toString()}
                    onValueChange={(value) => updateConfig({ syncInterval: Number.parseInt(value) })}
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

              <Button onClick={handleManualSync} disabled={syncStats.isLoading} className="w-full">
                {syncStats.isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Synchroniser maintenant
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
