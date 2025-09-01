"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Settings, Percent, Save, Info, Trash2, AlertTriangle, Upload, FileText } from "lucide-react"
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
    selectedMonth,
  } = useStore()

  const [localSettings, setLocalSettings] = useState(settings)
  const [saved, setSaved] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showClearCreatorsDialog, setShowClearCreatorsDialog] = useState(false)
  const [showClearStockDialog, setShowClearStockDialog] = useState(false)
  const [showClearSalesDialog, setShowClearSalesDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentMonthSales = salesData.filter((s) => s.month === selectedMonth)
  const currentMonthStock = stockData.filter((s) => s.month === selectedMonth)

  const handleSave = () => {
    updateSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner un fichier image")
        return
      }

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

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="templates">Templates Import</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres généraux
              </CardTitle>
              <CardDescription>Configurez les paramètres de votre boutique</CardDescription>
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
                        <img
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
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-transparent"
                      >
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
                  <p className="text-sm text-muted-foreground">Commission appliquée sur les paiements non-espèces</p>
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
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuration des templates d'import
              </CardTitle>
              <CardDescription>
                Configurez les noms des colonnes pour l'import de vos fichiers CSV/Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Stock */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Template Stock</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Colonne Créateur</Label>
                    <Input
                      value={localSettings.stockTemplate.creatorColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          stockTemplate: {
                            ...localSettings.stockTemplate,
                            creatorColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Item name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Article</Label>
                    <Input
                      value={localSettings.stockTemplate.articleColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          stockTemplate: {
                            ...localSettings.stockTemplate,
                            articleColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Variations"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Prix</Label>
                    <Input
                      value={localSettings.stockTemplate.priceColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          stockTemplate: {
                            ...localSettings.stockTemplate,
                            priceColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Quantité</Label>
                    <Input
                      value={localSettings.stockTemplate.quantityColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          stockTemplate: {
                            ...localSettings.stockTemplate,
                            quantityColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Quantity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne SKU (optionnel)</Label>
                    <Input
                      value={localSettings.stockTemplate.skuColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          stockTemplate: {
                            ...localSettings.stockTemplate,
                            skuColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="SKU"
                    />
                  </div>
                </div>
              </div>

              {/* Template Ventes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Template Ventes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Colonne Description</Label>
                    <Input
                      value={localSettings.salesTemplate.descriptionColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          salesTemplate: {
                            ...localSettings.salesTemplate,
                            descriptionColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Prix</Label>
                    <Input
                      value={localSettings.salesTemplate.priceColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          salesTemplate: {
                            ...localSettings.salesTemplate,
                            priceColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Mode de paiement</Label>
                    <Input
                      value={localSettings.salesTemplate.paymentColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          salesTemplate: {
                            ...localSettings.salesTemplate,
                            paymentColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Payment method"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Colonne Date</Label>
                    <Input
                      value={localSettings.salesTemplate.dateColumn}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          salesTemplate: {
                            ...localSettings.salesTemplate,
                            dateColumn: e.target.value,
                          },
                        })
                      }
                      placeholder="Date"
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important :</strong> Ces paramètres définissent quelles colonnes de vos fichiers CSV/Excel
                  correspondent à quelles données. Assurez-vous que les noms correspondent exactement aux en-têtes de
                  vos fichiers.
                </AlertDescription>
              </Alert>

              <Button onClick={handleSave} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder la configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Gestion des données
              </CardTitle>
              <CardDescription>Supprimez ou réinitialisez vos données par mois ou globalement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Données du mois actuel */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Données pour {formatMonth(selectedMonth)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Stock ({currentMonthStock.length} articles)</h4>
                    <Button
                      variant="outline"
                      onClick={() => setShowClearStockDialog(true)}
                      disabled={currentMonthStock.length === 0}
                      className="w-full bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer le stock de ce mois
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Ventes ({currentMonthSales.length} ventes)</h4>
                    <Button
                      variant="outline"
                      onClick={() => setShowClearSalesDialog(true)}
                      disabled={currentMonthSales.length === 0}
                      className="w-full bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer les ventes de ce mois
                    </Button>
                  </div>
                </div>
              </div>

              {/* Données globales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Données globales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Créateurs ({creators.length})</h4>
                    <Button
                      variant="outline"
                      onClick={() => setShowClearCreatorsDialog(true)}
                      disabled={creators.length === 0}
                      className="w-full bg-transparent"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer tous les créateurs
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Reset complet</h4>
                    <Button variant="destructive" onClick={() => setShowResetDialog(true)} className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reset complet de l'application
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Attention :</strong> La suppression des données est irréversible. Assurez-vous d'avoir
                  sauvegardé vos données importantes avant de procéder.
                </AlertDescription>
              </Alert>
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
        </TabsContent>
      </Tabs>

      {/* Dialogs de confirmation */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset complet</DialogTitle>
            <DialogDescription>
              Cette action supprimera TOUTES les données : créateurs, stock, ventes, archives et paramètres. Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetAllData()
                setShowResetDialog(false)
              }}
            >
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
              Cette action supprimera tous les créateurs ({creators.length}). Les données de stock et ventes associées
              seront également supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearCreatorsDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                removeAllCreators()
                setShowClearCreatorsDialog(false)
              }}
            >
              Supprimer tous les créateurs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearStockDialog} onOpenChange={setShowClearStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le stock de {formatMonth(selectedMonth)}</DialogTitle>
            <DialogDescription>
              Cette action supprimera tous les articles en stock pour ce mois ({currentMonthStock.length} articles).
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearStockDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearStockData()
                setShowClearStockDialog(false)
              }}
            >
              Supprimer le stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearSalesDialog} onOpenChange={setShowClearSalesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer les ventes de {formatMonth(selectedMonth)}</DialogTitle>
            <DialogDescription>
              Cette action supprimera toutes les ventes pour ce mois ({currentMonthSales.length} ventes). Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearSalesDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearSalesData()
                setShowClearSalesDialog(false)
              }}
            >
              Supprimer les ventes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
