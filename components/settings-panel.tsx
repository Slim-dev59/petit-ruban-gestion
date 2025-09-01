"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Settings, Percent, Save, Info, Trash2, AlertTriangle, Upload, ImageIcon } from "lucide-react"
import { useStore } from "@/lib/store"

export function SettingsPanel() {
  const {
    settings,
    updateSettings,
    removeAllCreators,
    resetAllData,
    clearStockData,
    clearSalesData,
    creators,
    stockData,
    salesData,
  } = useStore()
  const [localSettings, setLocalSettings] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showClearCreatorsDialog, setShowClearCreatorsDialog] = useState(false)
  const [showClearStockDialog, setShowClearStockDialog] = useState(false)
  const [showClearSalesDialog, setShowClearSalesDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Vérifier que c'est une image
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner un fichier image")
        return
      }

      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (max 2MB)")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLocalSettings({
          ...localSettings,
          logo: result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLocalSettings({
      ...localSettings,
      logo: undefined,
    })
  }

  const handleResetAll = () => {
    resetAllData()
    setLocalSettings({
      commissionRate: 1.75,
      shopName: "Ma Boutique Multi-Créateurs",
      autoApplyCommission: true,
    })
    setShowResetDialog(false)
  }

  const handleClearCreators = () => {
    removeAllCreators()
    setShowClearCreatorsDialog(false)
  }

  const handleClearStock = () => {
    clearStockData()
    setShowClearStockDialog(false)
  }

  const handleClearSales = () => {
    clearSalesData()
    setShowClearSalesDialog(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres généraux
          </CardTitle>
          <CardDescription>Configurez les paramètres de votre boutique multi-créateurs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Nom de la boutique</Label>
              <Input
                id="shop-name"
                value={localSettings.shopName}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    shopName: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Logo de la boutique</Label>
              <div className="space-y-4">
                {localSettings.logo && (
                  <div className="flex items-center gap-4">
                    <ImageIcon
                      src={localSettings.logo || "/placeholder.svg"}
                      alt="Logo"
                      className="h-16 w-16 object-contain border rounded"
                    />
                    <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-transparent">
                    <Upload className="h-4 w-4 mr-2" />
                    {localSettings.logo ? "Changer le logo" : "Ajouter un logo"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Formats acceptés: JPG, PNG, GIF. Taille max: 2MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission-rate">Taux de commission (%)</Label>
              <Input
                id="commission-rate"
                type="number"
                step="0.01"
                value={localSettings.commissionRate}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    commissionRate: Number.parseFloat(e.target.value) || 0,
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Commission appliquée sur les paiements non-espèces (actuellement {localSettings.commissionRate}%)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto-commission"
                checked={localSettings.autoApplyCommission}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...localSettings,
                    autoApplyCommission: checked,
                  })
                }
              />
              <Label htmlFor="auto-commission">Appliquer automatiquement la commission</Label>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder les paramètres
          </Button>

          {saved && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>Paramètres sauvegardés avec succès !</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Gestion des données
          </CardTitle>
          <CardDescription>Supprimez ou réinitialisez vos données</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Créateurs ({creators.length})</h4>
              <Button
                variant="outline"
                onClick={() => setShowClearCreatorsDialog(true)}
                disabled={creators.length === 0}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer tous les créateurs
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Articles en stock ({stockData.length})</h4>
              <Button
                variant="outline"
                onClick={() => setShowClearStockDialog(true)}
                disabled={stockData.length === 0}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer tout le stock
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Ventes ({salesData.length})</h4>
              <Button
                variant="outline"
                onClick={() => setShowClearSalesDialog(true)}
                disabled={salesData.length === 0}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer toutes les ventes
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Reset complet</h4>
              <Button variant="destructive" onClick={() => setShowResetDialog(true)} className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset complet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Règles de commission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Règle actuelle :</strong> Commission de {localSettings.commissionRate}% appliquée sur tous les
              paiements sauf les paiements en espèces.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h4 className="font-medium">Moyens de paiement exempts de commission :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Espèces</li>
              <li>• Cash</li>
              <li>• Liquide</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs de confirmation */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset complet</DialogTitle>
            <DialogDescription>
              Cette action supprimera TOUTES les données : créateurs, stock, ventes et paramètres. Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleResetAll}>
              Confirmer le reset complet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearCreatorsDialog} onOpenChange={setShowClearCreatorsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer tous les créateurs</DialogTitle>
            <DialogDescription>
              Cette action supprimera tous les créateurs ({creators.length}). Les données de stock et ventes seront
              conservées mais ne seront plus associées à des créateurs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearCreatorsDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleClearCreators}>
              Supprimer tous les créateurs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearStockDialog} onOpenChange={setShowClearStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer tout le stock</DialogTitle>
            <DialogDescription>
              Cette action supprimera tous les articles en stock ({stockData.length}). Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearStockDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleClearStock}>
              Supprimer tout le stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearSalesDialog} onOpenChange={setShowClearSalesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer toutes les ventes</DialogTitle>
            <DialogDescription>
              Cette action supprimera toutes les ventes ({salesData.length}). Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearSalesDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleClearSales}>
              Supprimer toutes les ventes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
