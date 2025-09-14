"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserManagement } from "@/components/auth/user-management"
import { SumUpIntegration } from "@/components/sumup-integration"
import {
  Palette,
  Settings,
  Users,
  Database,
  Shield,
  Zap,
  Upload,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  AlertCircle,
} from "lucide-react"

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState("appearance")
  const [settings, setSettings] = useState({
    theme: "light",
    language: "fr",
    notifications: true,
    autoSave: true,
    companyName: "Ma Boutique",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    logo: null as File | null,
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleSettingChange("logo", file)
    }
  }

  const saveSettings = () => {
    localStorage.setItem("app-settings", JSON.stringify(settings))
    // Afficher une notification de succès
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Paramètres</h1>
        <p className="text-gray-600">Configurez votre application selon vos préférences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 bg-slate-100 rounded-2xl p-2 h-auto">
          <TabsTrigger
            value="appearance"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Apparence</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Général</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Données</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Intégrations</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Thème</CardTitle>
              <CardDescription className="text-black">Personnalisez l'apparence de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black">Mode d'affichage</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                  <SelectTrigger className="text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Clair
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4" />
                        Sombre
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Système
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-black">Logo de l'entreprise</CardTitle>
              <CardDescription className="text-black">Ajoutez le logo de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo" className="text-black">
                  Fichier logo
                </Label>
                <div className="flex items-center gap-4">
                  <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="text-black" />
                  <Button variant="outline" className="text-black bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    Parcourir
                  </Button>
                </div>
                {settings.logo && <p className="text-sm text-green-600">Logo sélectionné: {settings.logo.name}</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Informations de l'entreprise</CardTitle>
              <CardDescription className="text-black">Configurez les informations de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-black">
                    Nom de l'entreprise
                  </Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => handleSettingChange("companyName", e.target.value)}
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-black">
                    Email
                  </Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => handleSettingChange("companyEmail", e.target.value)}
                    className="text-black"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress" className="text-black">
                  Adresse
                </Label>
                <Input
                  id="companyAddress"
                  value={settings.companyAddress}
                  onChange={(e) => handleSettingChange("companyAddress", e.target.value)}
                  className="text-black"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone" className="text-black">
                  Téléphone
                </Label>
                <Input
                  id="companyPhone"
                  value={settings.companyPhone}
                  onChange={(e) => handleSettingChange("companyPhone", e.target.value)}
                  className="text-black"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-black">Préférences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Langue</Label>
                  <p className="text-sm text-gray-600">Langue de l'interface</p>
                </div>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                  <SelectTrigger className="w-32 text-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Français
                      </div>
                    </SelectItem>
                    <SelectItem value="en">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        English
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Notifications</Label>
                  <p className="text-sm text-gray-600">Recevoir des notifications</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Sauvegarde automatique</Label>
                  <p className="text-sm text-gray-600">Sauvegarder automatiquement les modifications</p>
                </div>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Gestion des données</CardTitle>
              <CardDescription className="text-black">Importez, exportez et gérez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="text-black bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer des données
                </Button>
                <Button variant="outline" className="text-black bg-transparent">
                  <Database className="h-4 w-4 mr-2" />
                  Exporter des données
                </Button>
              </div>
              <Separator />
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-black">
                  La sauvegarde automatique est activée. Vos données sont sauvegardées toutes les 5 minutes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Sécurité</CardTitle>
              <CardDescription className="text-black">Configurez les paramètres de sécurité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-black">Session automatique</Label>
                    <p className="text-sm text-gray-600">Durée de session: 8 heures</p>
                  </div>
                  <Badge variant="secondary" className="text-black">
                    Actif
                  </Badge>
                </div>
                <Separator />
                <Button variant="outline" className="text-black bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <SumUpIntegration />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} className="text-white">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  )
}
