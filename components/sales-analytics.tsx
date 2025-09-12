"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar, Download } from "lucide-react"
import { useStore } from "@/lib/store"
import { useState } from "react"

export function SalesAnalytics() {
  const { creators, getSalesForCreator, getAllSalesForCreator, settings, currentMonth, monthlyData } = useStore()
  const [selectedCreator, setSelectedCreator] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)

  // Obtenir tous les mois disponibles
  const availableMonths = Object.keys(monthlyData).sort().reverse()

  // Calculer les statistiques pour le mois sélectionné
  const getMonthStats = (month: string) => {
    const monthData = monthlyData[month]
    if (!monthData) return { totalSales: 0, totalRevenue: 0, totalCommission: 0, salesByCreator: {} }

    const sales = monthData.salesData.filter((sale) => sale.statut !== "payee")
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
        }
        return acc
      },
      {} as Record<string, { count: number; revenue: number; commission: number; net: number }>,
    )

    return { totalSales, totalRevenue, totalCommission, salesByCreator }
  }

  const stats = getMonthStats(selectedMonth)

  const exportData = () => {
    const monthData = monthlyData[selectedMonth]
    if (!monthData) return

    const sales = monthData.salesData
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
    link.setAttribute("download", `ventes-${selectedMonth}.csv`)
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
          <h2 className="text-2xl font-bold">Analyse des ventes</h2>
          <p className="text-muted-foreground">Statistiques et performance par créateur</p>
        </div>
        <div className="flex gap-2">
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
            <p className="text-xs text-muted-foreground">ventes ce mois</p>
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
            Performance par créateur -{" "}
            {new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
          </CardTitle>
          <CardDescription>Détail des ventes et commissions par créateur</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Créateur</TableHead>
                <TableHead className="text-right">Ventes</TableHead>
                <TableHead className="text-right">CA Brut</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Net à verser</TableHead>
                <TableHead className="text-right">% du total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creators
                .filter((creator) => stats.salesByCreator[creator]?.count > 0)
                .sort((a, b) => stats.salesByCreator[b].revenue - stats.salesByCreator[a].revenue)
                .map((creator) => {
                  const creatorStats = stats.salesByCreator[creator]
                  const percentage = stats.totalRevenue > 0 ? (creatorStats.revenue / stats.totalRevenue) * 100 : 0

                  return (
                    <TableRow key={creator}>
                      <TableCell className="font-medium">{creator}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{creatorStats.count}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{creatorStats.revenue.toFixed(2)}€</TableCell>
                      <TableCell className="text-right text-red-600">-{creatorStats.commission.toFixed(2)}€</TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {creatorStats.net.toFixed(2)}€
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={percentage > 20 ? "default" : "secondary"}>{percentage.toFixed(1)}%</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>

          {Object.keys(stats.salesByCreator).filter((creator) => stats.salesByCreator[creator]?.count > 0).length ===
            0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune vente pour ce mois</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
