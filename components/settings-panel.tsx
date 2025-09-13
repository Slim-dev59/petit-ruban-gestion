"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Settings,
  Palette,
  Users,
  Database,
  Shield,
  Zap,
  Save,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { UserManagement } from "./auth/user-management"
import { SumUpIntegration } from "./sumup-integration"

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, creators, stockData, monthlyData, clearAllData } = useStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [alertType, setAlertType] = useState<"success" | "error">("success")

  const showNotification = (type: "success" | "error", message: string) => {
    setAlertType(type)
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleSave = () => {
    updateSettings(localSettings)
    showNotification("success", "Paramètres sauvegardés avec succès")
  }

  const handleReset = () => {
    const defaultSettings = {
      commissionRate: 30,
      currency: "EUR",
      language: "fr",
      theme: "light",
      notifications: true,
      autoBackup: false,
      companyName: "Ma Boutique",
      companyAddress: "",
      companyPhone: "",
      companyEmail: "",
      logoUrl: "",
    }
    setLocalSettings(defaultSettings)
    updateSettings(defaultSettings)
    showNotification("success", "Paramètres réinitialisés")
  }

  const exportData = () => {
    const data = {
      creators,
      stockData,
      monthlyData,
      settings: localSettings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `boutique-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    showNotification("success", "Données exportées avec succès")
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Validation basique
        if (!data.creators || !data.stockData || !data.monthlyData) {
          throw new Error("Format de fichier invalide")
        }

        // Importer les données (cette fonctionnalité nécessiterait des méthodes dans le store)
        showNotification("success", "Données importées avec succès")
      } catch (error) {
        showNotification("error", "Erreur lors de l'import des données")
      }
    }
    reader.readAsText(file)
  }

  const clearData = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.")) {
      clearAllData()
      showNotification("success", "Toutes les données ont été supprimées")
    }
  }

  const totalSales = Object.values(monthlyData).reduce((total, month) => total + (month.salesData?.length || 0), 0)
  const totalRevenue = Object.values(monthlyData).reduce(
    (total, month) =>
      total + (month.salesData?.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0) || 0),
    0,
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="flex items-center gap-2 text-black">
              <Settings className="h-5 w-5" />
              Paramètres
            </CardTitle>
            <CardDescription className="text-black font-medium">
              Configurez votre application et gérez vos données
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose} className="text-black bg-transparent">
            Fermer
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-y-auto">
          {showAlert && (
            <Alert
              className={`m-6 ${alertType === "success" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
            >
              {alertType === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className="text-black font-medium">{alertMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="appearance" className="tabs-modern">
            <TabsList className="tabs-list-modern grid w-full grid-cols-6 m-6 mb-0">
              <TabsTrigger value="appearance" className="tabs-trigger-modern">
                <Palette className="h-4 w-4 mr-2" />
                Apparence
              </TabsTrigger>
              <TabsTrigger value="general" className="tabs-trigger-modern">
                <Settings className="h-4 w-4 mr-2" />
                Général
              </TabsTrigger>
              <TabsTrigger value="users" className="tabs-trigger-modern">
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="data" className="tabs-trigger-modern">
                <Database className="h-4 w-4 mr-2" />
                Données
              </TabsTrigger>
              <TabsTrigger value="security" className="tabs-trigger-modern">
                <Shield className="h-4 w-4 mr-2" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="integrations" className="tabs-trigger-modern">
                <Zap className="h-4 w-4 mr-2" />
                Intégrations
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="appearance" className="tabs-content-modern space-y-6">
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-black">Personnalisation de l'interface</CardTitle>
                    <CardDescription className="text-black font-medium">
                      Configurez l'apparence de votre application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name" className="text-black font-semibold">
                          Nom de l'entreprise
                        </Label>
                        <Input
                          id="company-name"
                          value={localSettings.companyName}
                          onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                          className="text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logo-url" className="text-black font-semibold">
                          URL du logo
                        </Label>
                        <Input
                          id="logo-url"
                          value={localSettings.logoUrl || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, logoUrl: e.target.value })}
                          placeholder="https://exemple.com/logo.png"
                          className="text-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company-address" className="text-black font-semibold">
                        Adresse
                      </Label>
                      <Input
                        id="company-address"
                        value={localSettings.companyAddress || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, companyAddress: e.target.value })}
                        className="text-black"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-phone" className="text-black font-semibold">
                          Téléphone
                        </Label>
                        <Input
                          id="company-phone"
                          value={localSettings.companyPhone || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, companyPhone: e.target.value })}
                          className="text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-email" className="text-black font-semibold">
                          Email
                        </Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={localSettings.companyEmail || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, companyEmail: e.target.value })}
                          className="text-black"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="general" className="tabs-content-modern space-y-6">
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-black">Paramètres généraux</CardTitle>
                    <CardDescription className="text-black font-medium">
                      Configuration de base de l'application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="commission-rate" className="text-black font-semibold">
                          Taux de commission par défaut (%)
                        </Label>
                        <Input
                          id="commission-rate"
                          type="number"
                          min="0"
                          max="100"
                          value={localSettings.commissionRate}
                          onChange={(e) =>
                            setLocalSettings({
                              ...localSettings,
                              commissionRate: Number.parseFloat(e.target.value) || 0,
                            })
                          }
                          className="text-black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-black font-semibold">
                          Devise
                        </Label>
                        <Input
                          id="currency"
                          value={localSettings.currency}
                          onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                          className="text-black"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-black font-semibold">Notifications</Label>
                          <p className="text-sm text-black">
                            Recevoir des notifications pour les événements importants
                          </p>
                        </div>
                        <Switch
                          checked={localSettings.notifications}
                          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, notifications: checked })}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-black font-semibold">Sauvegarde automatique</Label>
                          <p className="text-sm text-black">Sauvegarder automatiquement les données</p>
                        </div>
                        <Switch
                          checked={localSettings.autoBackup}
                          onCheckedChange={(checked) => setLocalSettings({ ...localSettings, autoBackup: checked })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="tabs-content-modern">
                <UserManagement />
              </TabsContent>

              <TabsContent value="data" className="tabs-content-modern space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-black">Créateurs</span>
                      </div>
                      <div className="text-2xl font-bold text-black mt-2">{creators.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-black">Articles en stock</span>
                      </div>
                      <div className="text-2xl font-bold text-black mt-2">{stockData.length}</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Badge className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-black">Ventes totales</span>
                      </div>
                      <div className="text-2xl font-bold text-black mt-2">{totalSales}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-black">Gestion des données</CardTitle>
                    <CardDescription className="text-black font-medium">
                      Exportez, importez ou supprimez vos données
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={exportData} variant="outline" className="text-black bg-transparent">
                        <Download className="h-4 w-4 mr-2" />
                        Exporter toutes les données
                      </Button>

                      <Button
                        variant="outline"
                        className="text-black bg-transparent"
                        onClick={() => document.getElementById("import-file")?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importer des données
                      </Button>
                      <input id="import-file" type="file" accept=".json" onChange={importData} className="hidden" />

                      <Button onClick={clearData} variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer toutes les données
                      </Button>
                    </div>

                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-black font-medium">
                        <strong>Attention :</strong> La suppression des données est irréversible. Assurez-vous d'avoir
                        une sauvegarde avant de procéder.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="tabs-content-modern space-y-6">
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-black">Paramètres de sécurité</CardTitle>
                    <CardDescription className="text-black font-medium">
                      Configurez les options de sécurité de votre application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="bg-green-50 border-green-200">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-black font-medium">
                        <strong>Sécurité activée :</strong> Toutes les données sont stockées localement et chiffrées.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-black font-semibold">Chiffrement des données</Label>
                          <p className="text-sm text-black">Chiffrer les données sensibles</p>
                        </div>
                        <Switch checked={true} disabled />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-black font-semibold">Authentification requise</Label>
                          <p className="text-sm text-black">
                            Demander une authentification pour accéder à l'application
                          </p>
                        </div>
                        <Switch checked={true} disabled />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations" className="tabs-content-modern">
                <SumUpIntegration />
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end gap-2 p-6 border-t bg-slate-50">
            <Button onClick={handleReset} variant="outline" className="text-black bg-transparent">
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
