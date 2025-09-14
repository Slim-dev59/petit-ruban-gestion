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
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react"

interface CompanySettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
  logo?: string
}

export function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("fr")
  const [currency, setCurrency] = useState("EUR")
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "Ma Boutique Multi-Créateurs",
    address: "123 Rue de la Créativité, 75001 Paris",
    phone: "+33 1 23 45 67 89",
    email: "contact@boutique.com",
    website: "www.boutique.com",
  })

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanySettings((prev) => ({
          ...prev,
          logo: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-600 mt-2">Configurez votre application selon vos préférences</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-slate-100 rounded-2xl p-2 h-auto">
          <TabsTrigger
            value="appearance"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline text-slate-900">Apparence</span>
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline text-slate-900">Général</span>
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline text-slate-900">Utilisateurs</span>
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline text-slate-900">Données</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline text-slate-900">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline text-slate-900">Intégrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900">Thème et apparence</CardTitle>
              <CardDescription>Personnalisez l'apparence de votre interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base text-slate-900">Mode sombre</Label>
                  <p className="text-sm text-slate-600">Activer le thème sombre pour l'interface</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-slate-900">Langue de l'interface</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-slate-900">
                <Building className="h-5 w-5" />
                <span>Informations de l'entreprise</span>
              </CardTitle>
              <CardDescription>Configurez les informations de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo de l'entreprise */}
              <div className="space-y-4">
                <Label className="text-slate-900">Logo de l'entreprise</Label>
                <div className="flex items-center space-x-4">
                  {companySettings.logo ? (
                    <img
                      src={companySettings.logo || "/placeholder.svg"}
                      alt="Logo"
                      className="w-16 h-16 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Choisir un fichier</span>
                      </Button>
                    </Label>
                    <p className="text-sm text-slate-600 mt-1">PNG, JPG jusqu'à 2MB</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Informations de l'entreprise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-slate-900">
                    Nom de l'entreprise
                  </Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings((prev) => ({ ...prev, name: e.target.value }))}
                    className="text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-slate-900">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings((prev) => ({ ...prev, email: e.target.value }))}
                      className="pl-10 text-slate-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone" className="text-slate-900">
                    Téléphone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="companyPhone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10 text-slate-900"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite" className="text-slate-900">
                    Site web
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="companyWebsite"
                      value={companySettings.website}
                      onChange={(e) => setCompanySettings((prev) => ({ ...prev, website: e.target.value }))}
                      className="pl-10 text-slate-900"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress" className="text-slate-900">
                  Adresse
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="companyAddress"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings((prev) => ({ ...prev, address: e.target.value }))}
                    className="pl-10 text-slate-900"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-slate-900">Devise par défaut</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="USD">Dollar US ($)</SelectItem>
                    <SelectItem value="GBP">Livre Sterling (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Sauvegarder les modifications</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900">Gestion des données</CardTitle>
              <CardDescription>Importez, exportez et gérez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Database className="h-6 w-6 mb-2" />
                  <span className="text-slate-900">Exporter les données</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-slate-900">Importer des données</span>
                </Button>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Sauvegarde automatique</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Sauvegarder automatiquement les données</span>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900">Sécurité et confidentialité</CardTitle>
              <CardDescription>Gérez les paramètres de sécurité de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Authentification à deux facteurs</p>
                    <p className="text-sm text-slate-600">Ajouter une couche de sécurité supplémentaire</p>
                  </div>
                  <Badge variant="secondary">Bientôt disponible</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Sessions actives</p>
                    <p className="text-sm text-slate-600">Gérer les appareils connectés</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Voir les sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <SumUpIntegration />
        </TabsContent>
      </Tabs>
    </div>
  )
}
