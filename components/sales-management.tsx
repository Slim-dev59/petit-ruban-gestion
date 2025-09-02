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
import { exportToCSV, formatCurrency, parsePrice } from "@/lib/sales-utils"

export function SalesManagement() {
  const { salesData, creators, setSalesData, settings } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCreator, setFilterCreator] = useState("all")
  const [editingSale, setEditingSale] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    createur: string
    prix: string
  }>({ createur: "", prix: "" })

  // Filtrer les ventes
  const filteredSales = salesData.filter((sale) => {
    const matchesSearch =
      sale.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.createur?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCreator = filterCreator === "all" || sale.createur === filterCreator
    return matchesSearch && matchesCreator
  })

  // Statistiques
  const totalSales = salesData.reduce((sum, sale) => sum + parsePrice(sale.prix), 0)
  const totalCommissions = salesData.reduce((sum, sale) => {
    const price = parsePrice(sale.prix)
    const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
    return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
  }, 0)
  const identifiedSales = salesData.filter((sale) => sale.identified).length
  const uniqueCreators = new Set(salesData.map((sale) => sale.createur)).size

  const handleEditSale = (sale: any) => {
    setEditingSale(sale.id)
    setEditValues({
      createur: sale.createur,
      prix: sale.prix,
    })
  }

  const handleSaveEdit = (saleId: string) => {
    const updatedSales = salesData.map((sale) =>
      sale.id === saleId
        ? {
            ...sale,
            createur: editValues.createur,
            prix: editValues.prix,
            identified: editValues.createur !== "Non identifié",
          }
        : sale,
    )
    setSalesData(updatedSales)
    setEditingSale(null)
  }

  const handleCancelEdit = () => {
    setEditingSale(null)
    setEditValues({ createur: "", prix: "" })
  }

  const handleExportCSV = () => {
    const exportData = filteredSales.map((sale) => ({
      Date: sale.date,
      Description: sale.description,
      Prix: sale.prix,
      Créateur: sale.createur,
      Paiement: sale.paiement,
      Identifié: sale.identified ? "Oui" : "Non",
    }))
    exportToCSV(exportData, `ventes_${new Date().toISOString().split("T")[0]}.csv`)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Ventes</h2>
          <p className="text-gray-600">Visualisez et modifiez les attributions de ventes</p>
        </div>
        <Button onClick={handleExportCSV} variant="outline" className="bg-transparent">
          Exporter CSV
        </Button>
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
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
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
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalCommissions)}</p>
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
                <p className="text-sm text-gray-600">Ventes identifiées</p>
                <p className="text-xl font-bold text-gray-900">
                  {identifiedSales}/{salesData.length}
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
                  {creators.map((creator) => (
                    <SelectItem key={creator} value={creator}>
                      {creator}
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
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {sale.date}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate" title={sale.description}>
                      {sale.description}
                    </TableCell>
                    <TableCell>
                      {editingSale === sale.id ? (
                        <Input
                          type="text"
                          value={editValues.prix}
                          onChange={(e) => setEditValues((prev) => ({ ...prev, prix: e.target.value }))}
                          className="w-20"
                        />
                      ) : (
                        `${sale.prix}€`
                      )}
                    </TableCell>
                    <TableCell>
                      {editingSale === sale.id ? (
                        <Select
                          value={editValues.createur}
                          onValueChange={(value) => setEditValues((prev) => ({ ...prev, createur: value }))}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {creators.map((creator) => (
                              <SelectItem key={creator} value={creator}>
                                {creator}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={sale.identified ? "default" : "secondary"}>{sale.createur}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.paiement}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.identified ? "default" : "secondary"}>
                        {sale.identified ? "Identifiée" : "Non identifiée"}
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditSale(sale)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
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
