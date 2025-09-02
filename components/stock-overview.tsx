"use client"

import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Package, Euro, AlertTriangle } from "lucide-react"
import { formatCurrency, parsePrice } from "@/lib/sales-utils"

export function StockOverview() {
  const { stockData, creators } = useStore()

  // Calculer les statistiques
  const totalStockValue = stockData.reduce(
    (sum, item) => sum + parsePrice(item.price) * Number.parseInt(item.quantity || "0"),
    0,
  )
  const uniqueCreators = new Set(stockData.map((item) => item.createur)).size
  const lowStockItems = stockData.filter(
    (item) => Number.parseInt(item.quantity || "0") <= Number.parseInt(item.lowStockThreshold || "5"),
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aperçu du Stock</h2>
          <p className="text-gray-600">Visualisez l'état actuel de votre stock</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Articles en stock</p>
                <p className="text-xl font-bold text-gray-900">{stockData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Euro className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valeur totale du stock</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalStockValue)}</p>
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
                <p className="text-sm text-gray-600">Créateurs</p>
                <p className="text-xl font-bold text-gray-900">{uniqueCreators}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock faible</p>
                <p className="text-xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau du stock */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Articles en Stock</CardTitle>
          <CardDescription>Visualisez les articles actuellement en stock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockData.map((item, index) => {
                  const price = parsePrice(item.price)
                  const quantity = Number.parseInt(item.quantity || "0")
                  const threshold = Number.parseInt(item.lowStockThreshold || "5")
                  const value = price * quantity

                  let statusVariant: "default" | "secondary" | "destructive" = "default"
                  let statusText = "Normal"

                  if (quantity === 0) {
                    statusVariant = "destructive"
                    statusText = "Rupture"
                  } else if (quantity <= threshold) {
                    statusVariant = "secondary"
                    statusText = "Stock faible"
                  }

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.article}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.createur}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(price)}</TableCell>
                      <TableCell className="font-medium">{quantity}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(value)}</TableCell>
                      <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant}>{statusText}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {stockData.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun article en stock</p>
              <p className="text-sm text-gray-400">Importez des données de stock pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
