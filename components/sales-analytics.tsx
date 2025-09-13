"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, Download, Edit } from "lucide-react"
import { useStore } from "@/lib/store"
import { useState } from "react"

interface SaleEditDialogProps {
  sale: any
  onSave: (updates: any) => void
  creators: string[]
}

function SaleEditDialog({ sale, onSave, creators }: SaleEditDialogProps) {
  const [editedSale, setEditedSale] = useState({
    createur: sale.createur,
    prix: sale.prix,
    description: sale.description,
    paiement: sale.paiement,
  })
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    onSave(editedSale)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la vente</DialogTitle>
          <DialogDescription>Modifiez les détails de cette vente</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="createur">Créateur</Label>
            <Select
              value={editedSale.createur}
              onValueChange={(value) => setEditedSale({ ...editedSale, createur: value })}
            >
              <SelectTrigger>
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
          </div>
          <div>
            <Label htmlFor="prix">Prix (€)</Label>
            <Input
              id="prix"
              type="number"
              step="0.01"
              value={editedSale.prix}
              onChange={(e) => setEditedSale({ ...editedSale, prix: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={editedSale.description}
              onChange={(e) => setEditedSale({ ...editedSale, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="paiement">Mode de paiement</Label>
            <Select
              value={editedSale.paiement}
              onValueChange={(value) => setEditedSale({ ...editedSale, paiement: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                <SelectItem value="Espèces">Espèces</SelectItem>
                <SelectItem value="Chèque">Chèque</SelectItem>
                <SelectItem value="Virement">Virement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>Sauvegarder</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SalesAnalytics() {
  const { creators, getSalesForCreator, getAllSalesForCreator, settings, currentMonth, monthlyData, updateSale } =
    useStore()
  const [selectedCreator, setSelectedCreator] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [dateRange, setDateRange] = useState<"month" | "custom">("month")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")

  // Obtenir tous les mois disponibles
  const availableMonths = Object.keys(monthlyData).sort().reverse()

  // Fonction pour obtenir les ventes selon la période sélectionnée
  const getSalesForPeriod = () => {
    if (dateRange === "month") {
      const monthData = monthlyData[selectedMonth]
      return monthData ? monthData.salesData.filter((sale) => sale.statut !== "payee") : []
    } else {
      // Période personnalisée
      const startDate = new Date(customStartDate)
      const endDate = new Date(customEndDate)

      return Object.values(monthlyData)
        .flatMap((month) => month.salesData)
        .filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startDate && saleDate <= endDate && sale.statut !== "payee"
        })
    }
  }

  // Calculer les statistiques pour la période sélectionnée
  const getStats = () => {
    const sales = getSalesForPeriod()
    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
    const totalCommission = sales.reduce((sum, sale) => {
      const price = Number.parseFloat(sale.prix || "0")
      const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
      return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
    }, 0)

    const salesByCreator = creators.reduce(
      (acc, creator) => {
        const creatorSales = sales.filter((sale) => sale.createur === creator)
        const revenue = creatorSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
        const commission = creatorSales.reduce((sum, sale) => {
          const price = Number.parseFloat(sale.prix || "0")
          const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
          return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
        }, 0)

        acc[creator] = {
          count: creatorSales.length,
          revenue,
          commission,
          net: revenue - commission,
          sales: creatorSales,
        }
        return acc
      },
      {} as Record<string, { count: number; revenue: number; commission: number; net: number; sales: any[] }>,
    )

    return { totalSales, totalRevenue, totalCommission, salesByCreator }
  }

  const stats = getStats()

  const exportData = () => {
    const sales = getSalesForPeriod()
    const csvContent = [
      "Date,Créateur,Description,Prix,Paiement,Commission,Net",
      ...sales.map((sale) => {
        const price = Number.parseFloat(sale.prix || "0")
        const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
        const commission = isNotCash ? price * (settings.commissionRate / 100) : 0
        const net = price - commission

        return [
          sale.date,
          sale.createur,
          `"${sale.description}"`,
          sale.prix,
          sale.paiement,
          commission.toFixed(2),
          net.toFixed(2),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    const filename =
      dateRange === "month" ? `ventes-${selectedMonth}.csv` : `ventes-${customStartDate}-${customEndDate}.csv`
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSaleUpdate = (saleId: string, updates: any) => {
    // Trouver le mois de la vente
    let saleMonth = selectedMonth
    for (const [month, data] of Object.entries(monthlyData)) {
      if (data.salesData.some((sale) => sale.id === saleId)) {
        saleMonth = month
        break
      }
    }
    updateSale(saleId, updates, saleMonth)
  }

  const getPeriodLabel = () => {
    if (dateRange === "month") {
      return new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
    } else {
      return `${customStartDate} - ${customEndDate}`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analyse des ventes</h2>
          <p className="text-muted-foreground">Statistiques et performance par créateur</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(value: "month" | "custom") => setDateRange(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Par mois</SelectItem>
              <SelectItem value="custom">Période personnalisée</SelectItem>
            </SelectContent>
          </Select>

          {dateRange === "month" ? (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-40"
              />
            </div>
          )}

          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales}</div>
            <p className="text-xs text-muted-foreground">ventes - {getPeriodLabel()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">revenus bruts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{stats.totalCommission.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">{settings.commissionRate}% sur non-espèces</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net à verser</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stats.totalRevenue - stats.totalCommission).toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">après commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance par créateur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance par créateur - {getPeriodLabel()}
          </CardTitle>
          <CardDescription>
            Détail des ventes et commissions par créateur (cliquez sur les ventes pour les modifier)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {creators
              .filter((creator) => stats.salesByCreator[creator]?.count > 0)
              .sort((a, b) => stats.salesByCreator[b].revenue - stats.salesByCreator[a].revenue)
              .map((creator) => {
                const creatorStats = stats.salesByCreator[creator]
                const percentage = stats.totalRevenue > 0 ? (creatorStats.revenue / stats.totalRevenue) * 100 : 0

                return (
                  <div key={creator} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{creator}</h3>
                      <div className="flex gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{creatorStats.count}</div>
                          <div className="text-muted-foreground">ventes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{creatorStats.revenue.toFixed(2)}€</div>
                          <div className="text-muted-foreground">CA brut</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-600">-{creatorStats.commission.toFixed(2)}€</div>
                          <div className="text-muted-foreground">commission</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{creatorStats.net.toFixed(2)}€</div>
                          <div className="text-muted-foreground">net</div>
                        </div>
                        <div className="text-center">
                          <Badge variant={percentage > 20 ? "default" : "secondary"}>{percentage.toFixed(1)}%</Badge>
                          <div className="text-muted-foreground">du total</div>
                        </div>
                      </div>
                    </div>

                    {/* Liste des ventes du créateur */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Ventes détaillées:</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Date</TableHead>
                              <TableHead className="text-xs">Description</TableHead>
                              <TableHead className="text-xs text-right">Prix</TableHead>
                              <TableHead className="text-xs">Paiement</TableHead>
                              <TableHead className="text-xs text-right">Commission</TableHead>
                              <TableHead className="text-xs text-right">Net</TableHead>
                              <TableHead className="text-xs w-10"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {creatorStats.sales.map((sale) => {
                              const price = Number.parseFloat(sale.prix || "0")
                              const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                              const commission = isNotCash ? price * (settings.commissionRate / 100) : 0
                              const net = price - commission

                              return (
                                <TableRow key={sale.id} className="text-xs">
                                  <TableCell>{sale.date}</TableCell>
                                  <TableCell className="max-w-32 truncate">{sale.description}</TableCell>
                                  <TableCell className="text-right">{price.toFixed(2)}€</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {sale.paiement}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right text-red-600">
                                    {commission > 0 ? `-${commission.toFixed(2)}€` : "0€"}
                                  </TableCell>
                                  <TableCell className="text-right font-medium">{net.toFixed(2)}€</TableCell>
                                  <TableCell>
                                    <SaleEditDialog
                                      sale={sale}
                                      creators={creators}
                                      onSave={(updates) => handleSaleUpdate(sale.id, updates)}
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>

          {Object.keys(stats.salesByCreator).filter((creator) => stats.salesByCreator[creator]?.count > 0).length ===
            0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune vente pour cette période</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
