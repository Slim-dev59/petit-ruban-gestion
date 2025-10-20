"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserPlus, Package, CheckCircle, AlertCircle, Search, Link } from "lucide-react"
import { useStore } from "@/lib/store"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreatorStockAssignment() {
  const { creators, stockData, addCreator, updateCreatorMapping } = useStore()
  const [showNewCreatorDialog, setShowNewCreatorDialog] = useState(false)
  const [newCreatorName, setNewCreatorName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectedCreator, setSelectedCreator] = useState<string>("")
  const [assignmentStatus, setAssignmentStatus] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Filtrer les articles non assignés ou recherchés
  const filteredStock = stockData.filter((item) => {
    const matchesSearch =
      item.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleCreateCreator = () => {
    if (newCreatorName.trim()) {
      addCreator(newCreatorName.trim())
      setAssignmentStatus({
        type: "success",
        message: `Créateur "${newCreatorName}" créé avec succès !`,
      })
      setNewCreatorName("")
      setShowNewCreatorDialog(false)
      setTimeout(() => setAssignmentStatus(null), 3000)
    }
  }

  const toggleItemSelection = (sku: string) => {
    setSelectedItems((prev) => (prev.includes(sku) ? prev.filter((s) => s !== sku) : [...prev, sku]))
  }

  const handleAssignItems = () => {
    if (!selectedCreator) {
      setAssignmentStatus({
        type: "error",
        message: "Veuillez sélectionner un créateur",
      })
      return
    }

    if (selectedItems.length === 0) {
      setAssignmentStatus({
        type: "error",
        message: "Veuillez sélectionner au moins un article",
      })
      return
    }

    // Créer le mapping pour tous les articles sélectionnés
    const mapping: Record<string, string> = {}
    selectedItems.forEach((sku) => {
      const item = stockData.find((s) => s.sku === sku)
      if (item) {
        mapping[item.createur] = selectedCreator
      }
    })

    updateCreatorMapping(mapping)

    setAssignmentStatus({
      type: "success",
      message: `${selectedItems.length} article(s) assigné(s) à ${selectedCreator}`,
    })
    setSelectedItems([])
    setSelectedCreator("")
    setTimeout(() => setAssignmentStatus(null), 3000)
  }

  const unassignedCount = stockData.filter((item) => !item.createur || item.createur === "").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attribution des articles</h2>
          <p className="text-muted-foreground">Créez des créateurs et assignez-leur des articles du stock</p>
        </div>
        <Button onClick={() => setShowNewCreatorDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nouveau créateur
        </Button>
      </div>

      {unassignedCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {unassignedCount} article(s) sans créateur assigné. Assignez-les pour qu'ils apparaissent dans les rapports.
          </AlertDescription>
        </Alert>
      )}

      {assignmentStatus && (
        <Alert variant={assignmentStatus.type === "error" ? "destructive" : "default"}>
          {assignmentStatus.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{assignmentStatus.message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Assigner des articles
          </CardTitle>
          <CardDescription>
            Sélectionnez des articles et assignez-les à un créateur. L'IA les reconnaîtra automatiquement lors des
            prochains imports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher un article</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nom d'article ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-64">
              <Label htmlFor="creator-select">Créateur cible</Label>
              <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                <SelectTrigger id="creator-select">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {creators.map((creator) => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAssignItems} disabled={selectedItems.length === 0 || !selectedCreator}>
                <Link className="h-4 w-4 mr-2" />
                Assigner ({selectedItems.length})
              </Button>
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">{selectedItems.length} article(s) sélectionné(s)</div>
              <div className="flex flex-wrap gap-2">
                {selectedItems.map((sku) => {
                  const item = stockData.find((s) => s.sku === sku)
                  return item ? (
                    <Badge
                      key={sku}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => toggleItemSelection(sku)}
                    >
                      {item.article} ✕
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          )}

          <div className="border rounded-lg max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Article</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Créateur actuel</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      Aucun article trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStock.map((item) => (
                    <TableRow
                      key={item.sku}
                      className={selectedItems.includes(item.sku) ? "bg-muted" : "cursor-pointer hover:bg-muted/50"}
                      onClick={() => toggleItemSelection(item.sku)}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.sku)}
                          onChange={() => toggleItemSelection(item.sku)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{item.article}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>
                        {item.createur ? (
                          <Badge variant="outline">{item.createur}</Badge>
                        ) : (
                          <Badge variant="secondary">Non assigné</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{Number.parseFloat(item.price).toFixed(2)}€</TableCell>
                      <TableCell className="text-center">
                        <Badge>{item.quantity}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog nouveau créateur */}
      <Dialog open={showNewCreatorDialog} onOpenChange={setShowNewCreatorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau créateur</DialogTitle>
            <DialogDescription>Le nouveau créateur pourra se voir assigner des articles du stock.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-creator-name">Nom du créateur</Label>
              <Input
                id="new-creator-name"
                value={newCreatorName}
                onChange={(e) => setNewCreatorName(e.target.value)}
                placeholder="Ex: Marie Dupont"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCreatorDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateCreator} disabled={!newCreatorName.trim()}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
