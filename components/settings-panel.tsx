"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStore } from "@/lib/store"
import { UserManagement } from "@/components/auth/user-management"
import { SumUpIntegration } from "@/components/sumup-integration"
import { Settings, Store, Users, Palette, FileText, Bell, Zap, Upload, CheckCircle, AlertCircle } from "lucide-react"

export function SettingsPanel() {
  const { settings, updateSettings } = useStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSave = () => {
    updateSettings(localSettings)
    setMessage({ type: "success", text: "Paramètres sauvegardés avec succès !" })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return

    setIsUploading(true)
    try {
      // Créer une URL temporaire pour le fichier
      const logoUrl = URL.createObjectURL(logoFile)
      setLocalSettings((prev) => ({ ...prev, logoUrl }))
      setMessage({ type: "success", text: "Logo téléchargé avec succès !" })
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du téléchargement du logo" })
    } finally {
      setIsUploading(false)
      setLogoFile(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Paramètres</h2>
          <p className="text-muted-foreground">Configurez votre application selon vos besoins</p>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Apparence</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documents</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Intégrations</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Utilisateurs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de la boutique</CardTitle>
              <CardDescription>Configurez les informations de base de votre boutique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Nom de la boutique</Label>
                  <Input
                    id="shopName"
                    value={localSettings.shopName}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, shopName: e.target.value }))}
                    placeholder="Ma Boutique"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopSubtitle">Sous-titre</Label>
                  <Input
                    id="shopSubtitle"
                    value={localSettings.shopSubtitle}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, shopSubtitle: e.target.value }))}
                    placeholder="Gestion multi-créateurs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopAddress">Adresse</Label>
                <Textarea
                  id="shopAddress"
                  value={localSettings.shopAddress}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, shopAddress: e.target.value }))}
                  placeholder="123 Rue de la Boutique, 75001 Paris"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shopPhone">Téléphone</Label>
                  <Input
                    id="shopPhone"
                    value={localSettings.shopPhone}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, shopPhone: e.target.value }))}
                    placeholder="01 23 45 67 89"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopEmail">Email</Label>
                  <Input
                    id="shopEmail"
                    type="email"
                    value={localSettings.shopEmail}
                    onChange={(e) => setLocalSettings((prev) => ({ ...prev, shopEmail: e.target.value }))}
                    placeholder="contact@maboutique.fr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres de commission</CardTitle>
              <CardDescription>Configurez les taux de commission par défaut</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultCommission">Commission par défaut (%)</Label>
                  <Input
                    id="defaultCommission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={localSettings.defaultCommission}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        defaultCommission: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participationFee">Frais de participation (€)</Label>
                  <Input
                    id="participationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={localSettings.participationFee}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        participationFee: Number.parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo de la boutique</CardTitle>
              <CardDescription>Téléchargez le logo de votre boutique</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {localSettings.logoUrl && (
                <div className="flex items-center space-x-4">
                  <img
                    src={localSettings.logoUrl || "/placeholder.svg"}
                    alt="Logo actuel"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="text-sm font-medium">Logo actuel</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocalSettings((prev) => ({ ...prev, logoUrl: "" }))}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="logo">Nouveau logo</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button onClick={handleLogoUpload} disabled={!logoFile || isUploading}>
                    {isUploading ? <Upload className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thème et couleurs</CardTitle>
              <CardDescription>Personnalisez l'apparence de votre interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">Activer le thème sombre</p>
                </div>
                <Switch
                  checked={localSettings.darkMode}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, darkMode: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres des documents</CardTitle>
              <CardDescription>Configurez la génération des rapports et factures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Préfixe des factures</Label>
                <Input
                  id="invoicePrefix"
                  value={localSettings.invoicePrefix}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, invoicePrefix: e.target.value }))}
                  placeholder="FAC-"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportFooter">Pied de page des rapports</Label>
                <Textarea
                  id="reportFooter"
                  value={localSettings.reportFooter}
                  onChange={(e) => setLocalSettings((prev) => ({ ...prev, reportFooter: e.target.value }))}
                  placeholder="Merci de votre confiance"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Signature numérique</Label>
                  <p className="text-sm text-muted-foreground">Inclure une signature sur les documents</p>
                </div>
                <Switch
                  checked={localSettings.digitalSignature}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, digitalSignature: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configurez les alertes et notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                </div>
                <Switch
                  checked={localSettings.emailNotifications}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertes de stock faible</Label>
                  <p className="text-sm text-muted-foreground">Être alerté quand le stock est bas</p>
                </div>
                <Switch
                  checked={localSettings.lowStockAlerts}
                  onCheckedChange={(checked) => setLocalSettings((prev) => ({ ...prev, lowStockAlerts: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lowStockThreshold">Seuil de stock faible</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  min="0"
                  value={localSettings.lowStockThreshold}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({ ...prev, lowStockThreshold: Number.parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <SumUpIntegration />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setLocalSettings(settings)}>
          Annuler
        </Button>
        <Button onClick={handleSave}>
          <Settings className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}
