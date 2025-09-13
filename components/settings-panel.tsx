"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserManagement } from "@/components/auth/user-management"
import {
  Settings,
  Palette,
  Users,
  Database,
  Shield,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react"

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState("appearance")
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info")
  const [alertMessage, setAlertMessage] = useState("")

  const showNotification = (type: "success" | "error" | "warning" | "info", message: string) => {
    setAlertType(type)
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleExportData = () => {
    try {
      const data = {
        creators: JSON.parse(localStorage.getItem("creators") || "[]"),
        stock: JSON.parse(localStorage.getItem("stock") || "[]"),
        sales: JSON.parse(localStorage.getItem("sales") || "[]"),
        exportDate: new Date().toISOString(),
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `boutique-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showNotification("success", "Données exportées avec succès")
    } catch (error) {
      showNotification("error", "Erreur lors de l'export des données")
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.creators) localStorage.setItem("creators", JSON.stringify(data.creators))
        if (data.stock) localStorage.setItem("stock", JSON.stringify(data.stock))
        if (data.sales) localStorage.setItem("sales", JSON.stringify(data.sales))

        showNotification("success", "Données importées avec succès")
        window.location.reload()
      } catch (error) {
        showNotification("error", "Erreur lors de l'import des données")
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.")) {
      localStorage.removeItem("creators")
      localStorage.removeItem("stock")
      localStorage.removeItem("sales")
      showNotification("success", "Toutes les données ont été supprimées")
      window.location.reload()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-force-black">
              <Settings className="h-5 w-5" />
              Paramètres
            </CardTitle>
            <CardDescription className="text-force-black">Configuration et gestion de l'application</CardDescription>
          </div>
          <Button variant="outline" onClick={onClose} className="text-force-black bg-transparent">
            Fermer
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          {showAlert && (
            <Alert
              className={`mb-4 ${
                alertType === "success"
                  ? "border-green-500 bg-green-50"
                  : alertType === "error"
                    ? "border-red-500 bg-red-50"
                    : alertType === "warning"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-blue-500 bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {alertType === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                {alertType === "error" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {alertType === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                {alertType === "info" && <Info className="h-4 w-4 text-blue-600" />}
                <AlertDescription className="text-force-black">{alertMessage}</AlertDescription>
              </div>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-modern">
            <TabsList className="tabs-list-modern grid w-full grid-cols-5">
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
            </TabsList>

            <TabsContent value="appearance" className="tabs-content-modern space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-force-black">Interface</CardTitle>
                  <CardDescription className="text-force-black">
                    Personnalisez l'apparence de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-force-black">Thème</Label>
                      <div className="mt-2 space-y-2">
                        <Badge variant="secondary" className="text-force-black">
                          Clair (Actuel)
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-force-black">Police</Label>
                      <div className="mt-2 space-y-2">
                        <Badge variant="secondary" className="text-force-black">
                          Système (Actuel)
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="general" className="tabs-content-modern space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-force-black">Configuration générale</CardTitle>
                  <CardDescription className="text-force-black">Paramètres généraux de l'application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shop-name" className="text-force-black">
                        Nom de la boutique
                      </Label>
                      <Input id="shop-name" placeholder="Ma Boutique Multi-Créateurs" className="text-force-black" />
                    </div>
                    <div>
                      <Label htmlFor="currency" className="text-force-black">
                        Devise
                      </Label>
                      <Input id="currency" placeholder="EUR" className="text-force-black" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="commission" className="text-force-black">
                      Commission par défaut (%)
                    </Label>
                    <Input id="commission" type="number" placeholder="30" className="text-force-black" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="tabs-content-modern">
              <UserManagement />
            </TabsContent>

            <TabsContent value="data" className="tabs-content-modern space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-force-black">Gestion des données</CardTitle>
                  <CardDescription className="text-force-black">Sauvegarde et restauration des données</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={handleExportData}
                      className="flex items-center gap-2 text-force-black bg-transparent"
                      variant="outline"
                    >
                      <Download className="h-4 w-4" />
                      Exporter les données
                    </Button>

                    <div>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                        id="import-data"
                      />
                      <Button
                        onClick={() => document.getElementById("import-data")?.click()}
                        className="flex items-center gap-2 w-full text-force-black"
                        variant="outline"
                      >
                        <Upload className="h-4 w-4" />
                        Importer les données
                      </Button>
                    </div>

                    <Button onClick={handleClearData} variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Supprimer tout
                    </Button>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-force-black">
                      L'export inclut tous les créateurs, le stock et les ventes. Utilisez cette fonction pour
                      sauvegarder vos données régulièrement.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="tabs-content-modern space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-force-black">Sécurité</CardTitle>
                  <CardDescription className="text-force-black">
                    Paramètres de sécurité et d'authentification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription className="text-force-black">
                      <strong>Compte temporaire actif :</strong> N'oubliez pas de supprimer le compte "setup" après
                      avoir créé votre compte administrateur personnel.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-force-black">Sessions actives</Label>
                    <Badge variant="secondary" className="text-force-black">
                      1 session active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
