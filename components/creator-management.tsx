"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Users, Plus, Trash2, AlertTriangle, CheckCircle, Package, DollarSign } from "lucide-react"
import { useStore } from "@/lib/store"

export function CreatorManagement() {
  const { creators, addCreator, removeCreator, stockData, monthlyData, currentMonth } = useStore()
  const [newCreatorName, setNewCreatorName] = useState("")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [creatorToDelete, setCreatorToDelete] = useState("")
  const [addStatus, setAddStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleAddCreator = () => {
    if (!newCreatorName.trim()) {
      setAddStatus({ type: "error", message: "Veuillez saisir un nom de créateur" })
      return
    }

    if (creators.includes(newCreatorName.trim())) {
      setAddStatus({ type: "error", message: "Ce créateur existe déjà" })
      return
    }

    addCreator(newCreatorName.trim())
    setNewCreatorName("")
    setAddStatus({ type: "success", message: `Créateur "${newCreatorName.trim()}" ajouté avec succès` })
    setTimeout(() => setAddStatus(null), 3000)
  }

  const handleDeleteCreator = () => {
    removeCreator(creatorToDelete)
    setShowDeleteDialog(false)
    setCreatorToDelete("")
  }

  const getCreatorStats = (creator: string) => {
    const stockItems = stockData.filter((item) => item.createur === creator).length

    // Compter les ventes sur tous les mois
    let totalSales = 0
    let totalRevenue = 0

    Object.values(monthlyData).forEach((monthData) => {
      const creatorSales = monthData.salesData.filter((sale) => sale.createur === creator)
      totalSales += creatorSales.length
      totalRevenue += creatorSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
    })

    return { stockItems, totalSales, totalRevenue }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des créateurs</h2>
          <p className="text-slate-600 font-medium">Ajoutez et gérez vos créateurs</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2 bg-white border-slate-200 text-slate-900">
          <Users className="h-4 w-4" />
          {creators.length} créateurs
        </Badge>
      </div>

      {/* Ajout de créateur */}
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Plus className="h-5 w-5" />
            Ajouter un créateur
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Ajoutez un nouveau créateur à votre boutique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="creator-name" className="text-slate-900 font-semibold">
                Nom du créateur
              </Label>
              <Input
                id="creator-name"
                value={newCreatorName}
                onChange={(e) => setNewCreatorName(e.target.value)}
                placeholder="Nom du créateur"
                onKeyPress={(e) => e.key === "Enter" && handleAddCreator()}
                className="text-slate-900"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCreator} disabled={!newCreatorName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </div>
          </div>

          {addStatus && (
            <Alert
              variant={addStatus.type === "error" ? "destructive" : "default"}
              className="bg-white border-slate-200"
            >
              {addStatus.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription className="text-slate-900 font-medium">{addStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Liste des créateurs */}
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="h-5 w-5" />
            Liste des créateurs
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">Gérez vos créateurs existants</CardDescription>
        </CardHeader>
        <CardContent>
          {creators.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-900 font-semibold">Aucun créateur configuré</p>
              <p className="text-sm text-slate-600">Ajoutez votre premier créateur ci-dessus</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-900 font-semibold">Nom</TableHead>
                  <TableHead className="text-center text-slate-900 font-semibold">Articles en stock</TableHead>
                  <TableHead className="text-center text-slate-900 font-semibold">Ventes totales</TableHead>
                  <TableHead className="text-right text-slate-900 font-semibold">CA total</TableHead>
                  <TableHead className="text-center text-slate-900 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => {
                  const stats = getCreatorStats(creator)
                  return (
                    <TableRow key={creator}>
                      <TableCell className="font-medium text-slate-900">{creator}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 w-fit mx-auto bg-white border-slate-200 text-slate-900"
                        >
                          <Package className="h-3 w-3" />
                          {stats.stockItems}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-900 border-slate-200">
                          {stats.totalSales}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <div className="flex items-center justify-end gap-1 text-slate-900">
                          <DollarSign className="h-3 w-3" />
                          {stats.totalRevenue.toFixed(2)}€
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          onClick={() => {
                            setCreatorToDelete(creator)
                            setShowDeleteDialog(true)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmer la suppression
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Êtes-vous sûr de vouloir supprimer le créateur "{creatorToDelete}" ?
              <br />
              <br />
              <strong>Attention :</strong> Cette action ne supprimera pas les données de stock et de ventes associées,
              mais le créateur ne sera plus disponible pour de nouvelles attributions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteCreator}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
