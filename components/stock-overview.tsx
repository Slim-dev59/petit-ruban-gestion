"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Search, AlertTriangle, TrendingDown, Eye, Download } from "lucide-react"
import { useStore } from "@/lib/store"

export function StockOverview() {
  const { stockData, creators } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCreator, setSelectedCreator] = useState<string>("all")
  const [showLowStock, setShowLowStock] = useState(false)

  // Filtrer les données
  const filteredStock = stockData.filter((item) => {
    const matchesSearch =
      item.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.createur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCreator = selectedCreator === "all" || item.createur === selectedCreator

    const matchesLowStock =
      !showLowStock || Number.parseInt(item.quantity) <= Number.parseInt(item.lowStockThreshold || "0")

    return matchesSearch && matchesCreator && matchesLowStock
  })

  // Statistiques
  const totalItems = stockData.length
  const totalValue = stockData.reduce(
    (sum, item) => sum + Number.parseFloat(item.price) * Number.parseInt(item.quantity),
    0,
  )
  const lowStockItems = stockData.filter(
    (item) => Number.parseInt(item.quantity) <= Number.parseInt(item.lowStockThreshold || "0"),
  ).length
  const outOfStockItems = stockData.filter((item) => Number.parseInt(item.quantity) === 0).length

  const exportStock = () => {
    const csvContent = [
      "Créateur,Article,Prix,Quantité,Catégorie,SKU,Seuil stock bas,Image",
      ...filteredStock.map((item) =>
        [
          item.createur,
          `"${item.article}"`,
          item.price,
          item.quantity,
          item.category,
          item.sku,
          item.lowStockThreshold,
          item.image,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `stock-${selectedCreator === "all" ? "complet" : selectedCreator}-${new Date().toISOString().slice(0, 10)}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Aperçu du stock</h2>
          <p className="text-muted-foreground">Consultez et gérez votre inventaire</p>
        </div>
        <Button onClick={exportStock} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">articles en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">valeur du stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock bas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">articles en stock bas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupture</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">articles épuisés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par article, créateur ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCreator} onValueChange={setSelectedCreator}>
              <SelectTrigger className="w-48">
                <SelectValue />
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
            <Button variant={showLowStock ? "default" : "outline"} onClick={() => setShowLowStock(!showLowStock)}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stock bas uniquement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tableau du stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock ({filteredStock.length} articles)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStock.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun article trouvé</p>
              <p className="text-sm">Modifiez vos filtres ou importez du stock</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-center">Quantité</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-center">Statut</TableHead>
                  <TableHead className="text-center">Image</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((item, index) => {
                  const quantity = Number.parseInt(item.quantity)
                  const threshold = Number.parseInt(item.lowStockThreshold || "0")
                  const isLowStock = quantity <= threshold
                  const isOutOfStock = quantity === 0

                  return (
                    <TableRow key={index} className={isOutOfStock ? "bg-red-50" : isLowStock ? "bg-orange-50" : ""}>
                      <TableCell className="font-medium max-w-xs">
                        <div className="truncate" title={item.article}>
                          {item.article}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.createur}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {Number.parseFloat(item.price).toFixed(2)}€
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isOutOfStock ? "destructive" : isLowStock ? "secondary" : "default"}>
                          {quantity}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell className="text-center">
                        {isOutOfStock ? (
                          <Badge variant="destructive">Épuisé</Badge>
                        ) : isLowStock ? (
                          <Badge variant="secondary">Stock bas</Badge>
                        ) : (
                          <Badge variant="default">Disponible</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.image ? (
                          <Button variant="outline" size="sm" asChild>
                            <a href={item.image} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-3 w-3" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
