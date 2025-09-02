"use client"

import type React from "react"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Percent, FileText, Save, RotateCcw, Download, Upload } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SettingsPanel() {
  const { getCurrentData, updateSettings } = useStore()
  const currentData = getCurrentData()
  const [settings, setSettings] = useState(currentData.settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
    setHasChanges(true)
  }

  const handleTemplateChange = (templateType: "stockTemplate" | "salesTemplate", key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [templateType]: {
        ...prev[templateType],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    updateSettings(settings)
    setHasChanges(false)
    setSaveMessage("Paramètres sauvegardés avec succès !")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleReset = () => {
    setSettings(currentData.settings)
    setHasChanges(false)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "petit-ruban-settings.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          setSettings(importedSettings)
          setHasChanges(true)
        } catch (error) {
          alert("Erreur lors de l'import des paramètres")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
          <p className="text-gray-600">Configurez les templates d'import et les paramètres par défaut</p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Modifications non sauvegardées
            </Badge>
          )}
        </div>
      </div>

      {/* Message de sauvegarde */}
      {saveMessage && (
        <Alert className="border-green-200 bg-green-50">
          <Save className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{saveMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Paramètres Généraux
            </CardTitle>
            <CardDescription>Configuration des valeurs par défaut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCommission">Commission par défaut (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="defaultCommission"
                  type="number"
                  step="0.01"
                  value={settings.defaultCommission}
                  onChange={(e) => handleSettingChange("defaultCommission", Number.parseFloat(e.target.value))}
                  className="pl-10"
                  placeholder="1.75"
                />
              </div>
              <p className="text-xs text-gray-500">Commission appliquée par défaut aux nouveaux créateurs</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">Taux de commission (%)</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  value={settings.commissionRate}
                  onChange={(e) => handleSettingChange("commissionRate", Number.parseFloat(e.target.value))}
                  className="pl-10"
                  placeholder="1.75"
                />
              </div>
              <p className="text-xs text-gray-500">Taux de commission appliqué sur les ventes</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shopName">Nom de la boutique</Label>
              <Input
                id="shopName"
                value={settings.shopName}
                onChange={(e) => handleSettingChange("shopName", e.target.value)}
                placeholder="Petit-Ruban"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Sauvegarde et gestion des paramètres</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} disabled={!hasChanges} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder les modifications
              </Button>

              <Button variant="outline" onClick={handleReset} disabled={!hasChanges} className="w-full bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Annuler les modifications
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" onClick={exportSettings} className="w-full bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Exporter les paramètres
              </Button>

              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => document.getElementById("import-settings")?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importer les paramètres
                </Button>
                <input
                  id="import-settings"
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates d'import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template Import Stock
            </CardTitle>
            <CardDescription>Configuration des colonnes pour l'import de stock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stockNameColumn">Colonne Nom</Label>
              <Input
                id="stockNameColumn"
                value={settings.stockTemplate.nameColumn}
                onChange={(e) => handleTemplateChange("stockTemplate", "nameColumn", e.target.value)}
                placeholder="Nom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockCreatorColumn">Colonne Créateur</Label>
              <Input
                id="stockCreatorColumn"
                value={settings.stockTemplate.creatorColumn}
                onChange={(e) => handleTemplateChange("stockTemplate", "creatorColumn", e.target.value)}
                placeholder="Créateur"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockPriceColumn">Colonne Prix</Label>
              <Input
                id="stockPriceColumn"
                value={settings.stockTemplate.priceColumn}
                onChange={(e) => handleTemplateChange("stockTemplate", "priceColumn", e.target.value)}
                placeholder="Prix"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantityColumn">Colonne Quantité</Label>
              <Input
                id="stockQuantityColumn"
                value={settings.stockTemplate.quantityColumn}
                onChange={(e) => handleTemplateChange("stockTemplate", "quantityColumn", e.target.value)}
                placeholder="Quantité"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockArticleColumn">Colonne Article</Label>
              <Input
                id="stockArticleColumn"
                value={settings.stockTemplate.articleColumn}
                onChange={(e) => handleTemplateChange("stockTemplate", "articleColumn", e.target.value)}
                placeholder="Article"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockSkuColumn">Colonne SKU</Label>
              <Input
                id="stockSkuColumn"
                value={settings.stockTemplate.skuColumn}
                onChange={(e) => handleTemplateChange("stockTemplate", "skuColumn", e.target.value)}
                placeholder="SKU"
              />
            </div>
          </CardContent>
        </Card>

        {/* Template Ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Template Import Ventes
            </CardTitle>
            <CardDescription>Configuration des colonnes pour l'import de ventes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salesNameColumn">Colonne Article</Label>
              <Input
                id="salesNameColumn"
                value={settings.salesTemplate.nameColumn}
                onChange={(e) => handleTemplateChange("salesTemplate", "nameColumn", e.target.value)}
                placeholder="Article"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesDescriptionColumn">Colonne Description</Label>
              <Input
                id="salesDescriptionColumn"
                value={settings.salesTemplate.descriptionColumn}
                onChange={(e) => handleTemplateChange("salesTemplate", "descriptionColumn", e.target.value)}
                placeholder="Description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesPriceColumn">Colonne Prix</Label>
              <Input
                id="salesPriceColumn"
                value={settings.salesTemplate.priceColumn}
                onChange={(e) => handleTemplateChange("salesTemplate", "priceColumn", e.target.value)}
                placeholder="Prix"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesDateColumn">Colonne Date</Label>
              <Input
                id="salesDateColumn"
                value={settings.salesTemplate.dateColumn}
                onChange={(e) => handleTemplateChange("salesTemplate", "dateColumn", e.target.value)}
                placeholder="Date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesPaymentColumn">Colonne Paiement</Label>
              <Input
                id="salesPaymentColumn"
                value={settings.salesTemplate.paymentColumn}
                onChange={(e) => handleTemplateChange("salesTemplate", "paymentColumn", e.target.value)}
                placeholder="Paiement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salesQuantityColumn">Colonne Quantité</Label>
              <Input
                id="salesQuantityColumn"
                value={settings.salesTemplate.quantityColumn}
                onChange={(e) => handleTemplateChange("salesTemplate", "quantityColumn", e.target.value)}
                placeholder="Quantité"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
