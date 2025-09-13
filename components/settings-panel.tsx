"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { UserManagement } from "@/components/auth/user-management"
import { SumUpIntegration } from "@/components/sumup-integration"
import { Palette, Settings, Users, Database, Shield, Zap, Upload, Building, Mail, Phone, MapPin } from "lucide-react"

export function SettingsPanel() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "Boutique Multi-Créateurs",
    address: "123 Rue de la Créativité",
    city: "Paris",
    postalCode: "75001",
    phone: "01 23 45 67 89",
    email: "contact@boutique-multi-createurs.fr",
    website: "www.boutique-multi-createurs.fr",
    logo: null as File | null,
  })

  const [preferences, setPreferences] = useState({
    darkMode: false,
    notifications: true,
    autoSave: true,
    language: "fr",
    currency: "EUR",
  })

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCompanyInfo((prev) => ({ ...prev, logo: file }))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Paramètres</h1>
        <p className="text-gray-600">Configurez votre application et vos préférences</p>
      </div>

      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid grid-cols-6 bg-slate-100 rounded-2xl p-2 h-auto">
          <TabsTrigger
            value="appearance"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <Palette className="h-4 w-4 mr-2" />
            Apparence
          </TabsTrigger>
          <TabsTrigger
            value="general"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <Settings className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <Database className="h-4 w-4 mr-2" />
            Données
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <Shield className="h-4 w-4 mr-2" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="h-12 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 text-black"
          >
            <Zap className="h-4 w-4 mr-2" />
            Intégrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Thème et apparence</CardTitle>
              <CardDescription className="text-black">Personnalisez l'apparence de votre interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Mode sombre</Label>
                  <p className="text-sm text-gray-600">Activer le thème sombre</p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, darkMode: checked }))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-black">Logo de l'entreprise</Label>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="text-black" />
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
                {companyInfo.logo && (
                  <p className="text-sm text-green-600">Logo téléchargé : {companyInfo.logo.name}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Building className="h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
              <CardDescription className="text-black">Configurez les informations de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-black">
                    Nom de l'entreprise
                  </Label>
                  <Input
                    id="companyName"
                    value={companyInfo.name}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, name: e.target.value }))}
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={companyInfo.email}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, email: e.target.value }))}
                      className="pl-10 text-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-black">
                    Téléphone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={companyInfo.phone}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, phone: e.target.value }))}
                      className="pl-10 text-black"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-black">
                    Site web
                  </Label>
                  <Input
                    id="website"
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo((prev) => ({ ...prev, website: e.target.value }))}
                    className="text-black"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <Label className="text-black">Adresse</Label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Input
                      placeholder="Adresse"
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, address: e.target.value }))}
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Code postal"
                      value={companyInfo.postalCode}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, postalCode: e.target.value }))}
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Ville"
                      value={companyInfo.city}
                      onChange={(e) => setCompanyInfo((prev) => ({ ...prev, city: e.target.value }))}
                      className="text-black"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-black">Préférences</CardTitle>
              <CardDescription className="text-black">Configurez vos préférences d'utilisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Notifications</Label>
                  <p className="text-sm text-gray-600">Recevoir des notifications</p>
                </div>
                <Switch
                  checked={preferences.notifications}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, notifications: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-black">Sauvegarde automatique</Label>
                  <p className="text-sm text-gray-600">Sauvegarder automatiquement les modifications</p>
                </div>
                <Switch
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoSave: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Gestion des données</CardTitle>
              <CardDescription className="text-black">Importez, exportez et gérez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Database className="h-6 w-6" />
                  <span className="text-black">Exporter les données</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Upload className="h-6 w-6" />
                  <span className="text-black">Importer des données</span>
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-black">Sauvegarde automatique</Label>
                <p className="text-sm text-gray-600">Les données sont sauvegardées automatiquement toutes les heures</p>
                <Badge variant="secondary">Dernière sauvegarde : Il y a 23 minutes</Badge>
              </div>
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
                <div>
                  <Label className="text-black">Durée de session</Label>
                  <p className="text-sm text-gray-600">8 heures</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-black">Authentification à deux facteurs</Label>
                  <p className="text-sm text-gray-600">Non configurée</p>
                  <Button variant="outline" className="mt-2 bg-transparent">
                    Configurer 2FA
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
