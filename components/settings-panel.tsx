"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Save,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Percent,
  Store,
  Database,
  Home,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { Type } from "lucide-react"

export function SettingsPanel() {
  const { settings, updateSettings, resetAllData, creators, stockData, monthlyData } = useStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleSave = () => {
    updateSettings(localSettings)
    setSaveStatus({ type: "success", message: "Paramètres sauvegardés avec succès !" })
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const handleReset = () => {
    if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.")) {
      resetAllData()
      setSaveStatus({ type: "success", message: "Données réinitialisées avec succès !" })
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setSaveStatus({ type: "error", message: "Le fichier est trop volumineux (max 2MB)" })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setLocalSettings({ ...localSettings, logoUrl: result })
    }
    reader.readAsDataURL(file)
  }

  const exportData = () => {
    const data = {
      creators,
      stockData,
      monthlyData,
      settings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `boutique-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setSaveStatus({ type: "success", message: "Fichier de sauvegarde lu avec succès !" })
      } catch (error) {
        setSaveStatus({ type: "error", message: "Erreur lors de la lecture du fichier de sauvegarde" })
      }
    }
    reader.readAsText(file)
  }

  // Calculer les statistiques
  const totalMonths = Object.keys(monthlyData).length
  const totalSales = Object.values(monthlyData).reduce((sum, month) => sum + month.salesData.length, 0)
  const totalParticipations = Object.values(monthlyData).reduce((sum, month) => sum + month.participations.length, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres</h2>
          <p className="text-muted-foreground">Configuration générale de l'application</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {totalMonths} mois • {totalSales} ventes • {totalParticipations} participations
          </Badge>
        </div>
      </div>

      {/* Paramètres d'apparence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Apparence et branding
          </CardTitle>
          <CardDescription>Personnalisez l'apparence de votre application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Nom de la boutique</Label>
              <Input
                id="shop-name"
                value={localSettings.shopName}
                onChange={(e) => setLocalSettings({ ...localSettings, shopName: e.target.value })}
                placeholder="Ma Boutique Multi-Créateurs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop-subtitle">Sous-titre</Label>
              <Input
                id="shop-subtitle"
                value={localSettings.shopSubtitle}
                onChange={(e) => setLocalSettings({ ...localSettings, shopSubtitle: e.target.value })}
                placeholder="Gestion des ventes et créateurs"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-upload">Logo de l'application</Label>
            <div className="flex items-center gap-4">
              {localSettings.logoUrl && (
                <div className="w-16 h-16 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={localSettings.logoUrl || "/placeholder.svg"}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-muted file:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">Formats acceptés: JPG, PNG, GIF (max 2MB)</p>
              </div>
              {localSettings.logoUrl && (
                <Button variant="outline" size="sm" onClick={() => setLocalSettings({ ...localSettings, logoUrl: "" })}>
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres généraux */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres généraux
          </CardTitle>
          <CardDescription>Configuration de base de votre boutique</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commission-rate">Taux de commission (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="commission-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={localSettings.commissionRate}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, commissionRate: Number.parseFloat(e.target.value) || 0 })
                  }
                />
                <Percent className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Commission appliquée sur les paiements non-espèces</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loyer-mensuel">Loyer mensuel par défaut (€)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="loyer-mensuel"
                  type="number"
                  step="0.01"
                  min="0"
                  value={localSettings.loyerMensuel}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, loyerMensuel: Number.parseFloat(e.target.value) || 0 })
                  }
                />
                <Home className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Montant du loyer mensuel pour les participations</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-commission"
              checked={localSettings.autoApplyCommission}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, autoApplyCommission: checked })}
            />
            <Label htmlFor="auto-commission">Appliquer automatiquement les commissions</Label>
          </div>

          <Separator />

          <div className="flex justify-between">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </div>

          {saveStatus && (
            <Alert variant={saveStatus.type === "error" ? "destructive" : "default"}>
              {saveStatus.type === "error" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sauvegarde et restauration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sauvegarde et restauration
          </CardTitle>
          <CardDescription>Exportez ou importez vos données</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exporter les données</Label>
              <Button onClick={exportData} variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Télécharger la sauvegarde
              </Button>
              <p className="text-xs text-muted-foreground">
                Exporte toutes vos données (créateurs, stock, ventes, paiements, participations, paramètres)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-file">Importer les données</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-muted file:text-muted-foreground"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Restaure les données depuis un fichier de sauvegarde</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone de danger */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Zone de danger
          </CardTitle>
          <CardDescription>Actions irréversibles - utilisez avec précaution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-800">Réinitialiser toutes les données</h4>
                  <p className="text-sm text-red-600">
                    Supprime définitivement tous les créateurs, stock, ventes, paiements, participations et paramètres
                  </p>
                </div>
                <Button onClick={handleReset} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Statistiques de l'application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{creators.length}</div>
              <div className="text-sm text-muted-foreground">Créateurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stockData.length}</div>
              <div className="text-sm text-muted-foreground">Articles en stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalSales}</div>
              <div className="text-sm text-muted-foreground">Ventes totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalParticipations}</div>
              <div className="text-sm text-muted-foreground">Participations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalMonths}</div>
              <div className="text-sm text-muted-foreground">Mois de données</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
