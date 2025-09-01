"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Search, Download, CheckCircle, AlertTriangle, Euro } from "lucide-react"
import { useStore } from "@/lib/store"

export function SalesManagement() {
  const { salesData, stockData, creators, selectedMonth, updateSaleCreator, getSalesForCreator, settings } = useStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCreator, setSelectedCreator] = useState("all") // Updated default value to "all"
  const [showUnidentifiedOnly, setShowUnidentifiedOnly] = useState(false)

  // Filtrer les ventes du mois sélectionné
  const currentMonthSales = useMemo(() => {
    return salesData.filter((sale) => sale.month === selectedMonth)
  }, [salesData, selectedMonth])

  // Appliquer les filtres
  const filteredSales = useMemo(() => {
    return currentMonthSales.filter((sale) => {
      const matchesSearch =
        sale.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.createur.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCreator = selectedCreator === "all" || sale.createur === selectedCreator
      const matchesUnidentified = !showUnidentifiedOnly || !sale.identified

      return matchesSearch && matchesCreator && matchesUnidentified
    })
  }, [currentMonthSales, searchTerm, selectedCreator, showUnidentifiedOnly])

  // Statistiques
  const stats = useMemo(() => {
    const totalSales = currentMonthSales.length
    const identifiedSales = currentMonthSales.filter((s) => s.identified).length
    const unidentifiedSales = totalSales - identifiedSales
    const totalCA = currentMonthSales.reduce((sum, sale) => {
      const price = Number.parseFloat(sale.prix?.replace(",", ".") || "0")
      return sum + (isNaN(price) ? 0 : price)
    }, 0)

    return { totalSales, identifiedSales, unidentifiedSales, totalCA }
  }, [currentMonthSales])

  const handleCreatorChange = (saleId: string, newCreator: string) => {
    updateSaleCreator(saleId, newCreator)
  }

  const exportSales = () => {
    const csvContent = [
      ["Date", "Description", "Prix", "Paiement", "Créateur", "Identifié"].join(","),
      ...filteredSales.map((sale) =>
        [
          sale.date,
          `"${sale.description}"`,
          sale.prix,
          sale.paiement,
          sale.createur,
          sale.identified ? "Oui" : "Non",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ventes_${selectedMonth}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gestion des Ventes - {formatMonth(selectedMonth)}
          </CardTitle>
          <CardDescription>Visualisez et modifiez l'attribution des ventes pour le mois sélectionné</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total ventes</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.totalSales}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Identifiées</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.identifiedSales}</p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Non identifiées</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{stats.unidentifiedSales}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">CA Total</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{stats.totalCA.toFixed(2)}€</p>
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCreator} onValueChange={setSelectedCreator}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les créateurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les créateurs</SelectItem> {/* Updated value prop */}
                {creators.map((creator) => (
                  <SelectItem key={creator} value={creator}>
                    {creator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="unidentified-only"
                checked={showUnidentifiedOnly}
                onChange={(e) => setShowUnidentifiedOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="unidentified-only" className="text-sm font-medium">
                Non identifiées uniquement
              </label>
            </div>

            <Button onClick={exportSales} variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Exporter ({filteredSales.length})
            </Button>
          </div>

          {stats.unidentifiedSales > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{stats.unidentifiedSales} vente(s) non identifiée(s)</strong> nécessitent votre attention.
                Utilisez les menus déroulants pour les attribuer aux bons créateurs.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tableau des ventes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ventes ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow key={sale.id} className={!sale.identified ? "bg-red-50" : ""}>
                    <TableCell className="text-sm">{new Date(sale.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium truncate" title={sale.description}>
                          {sale.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number.parseFloat(sale.prix?.replace(",", ".") || "0").toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {sale.paiement}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={sale.identified ? "text-gray-900" : "text-red-600 font-medium"}>
                          {sale.createur}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sale.identified ? "default" : "destructive"} className="text-xs">
                        {sale.identified ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Identifiée
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Non identifiée
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={sale.createur} onValueChange={(value) => handleCreatorChange(sale.id, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {creators
                            .filter((c) => c !== "Non identifié")
                            .map((creator) => (
                              <SelectItem key={creator} value={creator}>
                                {creator}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune vente trouvée pour ce mois</p>
              <p className="text-sm text-gray-400 mt-2">Importez des données ou changez de mois pour voir les ventes</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Répartition par créateur */}
      {currentMonthSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Répartition par créateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator) => {
                const creatorSales = getSalesForCreator(creator)
                const totalCA = creatorSales.reduce((sum, sale) => {
                  const price = Number.parseFloat(sale.prix?.replace(",", ".") || "0")
                  return sum + (isNaN(price) ? 0 : price)
                }, 0)
                const commission = creatorSales.reduce((sum, sale) => {
                  const price = Number.parseFloat(sale.prix?.replace(",", ".") || "0")
                  if (isNaN(price)) return sum

                  const isNotCash =
                    sale.paiement?.toLowerCase() !== "espèces" &&
                    sale.paiement?.toLowerCase() !== "cash" &&
                    sale.paiement?.toLowerCase() !== "liquide"
                  return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
                }, 0)

                if (creatorSales.length === 0) return null

                return (
                  <div key={creator} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{creator}</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ventes:</span>
                        <span className="font-medium">{creatorSales.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CA:</span>
                        <span className="font-medium">{totalCA.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission:</span>
                        <span className="font-medium text-red-600">-{commission.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-medium">Net:</span>
                        <span className="font-bold text-green-600">{(totalCA - commission).toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
