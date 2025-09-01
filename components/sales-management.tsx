"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Search, Filter, Edit2, Check, X, Euro, Users, ShoppingCart, Calendar } from "lucide-react"

export function SalesManagement() {
  const { getCurrentData, updateSale } = useStore()
  const currentData = getCurrentData()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCreator, setFilterCreator] = useState("all")
  const [editingSale, setEditingSale] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    creatorId: string
    commission: number
  }>({ creatorId: "", commission: 0 })

  // Filtrer les ventes
  const filteredSales = currentData.sales.filter((sale) => {
    const matchesSearch =
      sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.creator.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCreator = filterCreator === "all" || sale.creator === filterCreator
    return matchesSearch && matchesCreator
  })

  // Statistiques
  const totalSales = currentData.sales.reduce((sum, sale) => sum + sale.price, 0)
  const totalCommissions = currentData.sales.reduce((sum, sale) => sum + (sale.price * sale.commission) / 100, 0)
  const validatedSales = currentData.sales.filter((sale) => sale.isValidated).length
  const uniqueCreators = new Set(currentData.sales.map((sale) => sale.creator)).size

  const handleEditSale = (sale: any) => {
    setEditingSale(sale.id)
    setEditValues({
      creatorId: sale.creator,
      commission: sale.commission,
    })
  }

  const handleSaveEdit = (saleId: string) => {
    updateSale(saleId, {
      creator: editValues.creatorId,
      commission: editValues.commission,
    })
    setEditingSale(null)
  }

  const handleCancelEdit = () => {
    setEditingSale(null)
    setEditValues({ creatorId: "", commission: 0 })
  }

  const toggleValidation = (saleId: string, currentStatus: boolean) => {
    updateSale(saleId, { isValidated: !currentStatus })
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h2>
          <p className="text-gray-600">Visualisez et modifiez les attributions de ventes</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ventes totales</p>
                <p className="text-xl font-bold text-gray-900">{totalSales.toFixed(2)} €</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Commissions</p>
                <p className="text-xl font-bold text-gray-900">{totalCommissions.toFixed(2)} €</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ventes validées</p>
                <p className="text-xl font-bold text-gray-900">
                  {validatedSales}/{currentData.sales.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Créateurs actifs</p>
                <p className="text-xl font-bold text-gray-900">{uniqueCreators}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par article ou créateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={filterCreator} onValueChange={setFilterCreator}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrer par créateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les créateurs</SelectItem>
                  {currentData.creators.map((creator) => (
                    <SelectItem key={creator.id} value={creator.id}>
                      {creator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des ventes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Ventes</CardTitle>
          <CardDescription>
            {filteredSales.length} vente{filteredSales.length > 1 ? "s" : ""} trouvée
            {filteredSales.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.itemName}</TableCell>
                    <TableCell>{sale.price.toFixed(2)} €</TableCell>
                    <TableCell>
                      {editingSale === sale.id ? (
                        <Select
                          value={editValues.creatorId}
                          onValueChange={(value) => setEditValues((prev) => ({ ...prev, creatorId: value }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentData.creators.map((creator) => (
                              <SelectItem key={creator.id} value={creator.id}>
                                {creator.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: currentData.creators.find((c) => c.id === sale.creator)?.color + "20",
                            borderColor: currentData.creators.find((c) => c.id === sale.creator)?.color,
                          }}
                        >
                          {sale.creator}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingSale === sale.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues.commission}
                          onChange={(e) =>
                            setEditValues((prev) => ({ ...prev, commission: Number.parseFloat(e.target.value) }))
                          }
                          className="w-20"
                        />
                      ) : (
                        `${sale.commission}%`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {new Date(sale.date).toLocaleDateString("fr-FR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.isValidated ? "default" : "secondary"}>
                        {sale.isValidated ? "Validée" : "En attente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {editingSale === sale.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(sale.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditSale(sale)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleValidation(sale.id, sale.isValidated)}
                              className="h-8 w-8 p-0"
                            >
                              {sale.isValidated ? (
                                <X className="w-4 h-4 text-red-600" />
                              ) : (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune vente trouvée</p>
              <p className="text-sm text-gray-400">
                {searchTerm || filterCreator !== "all"
                  ? "Essayez de modifier vos filtres"
                  : "Importez des données de vente pour commencer"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
