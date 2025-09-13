"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Eye, Calendar } from "lucide-react"
import { useStore } from "@/lib/store"

export function PDFGenerator() {
  const { creators, settings, monthlyData, currentMonth, stockData } = useStore()
  const [selectedCreator, setSelectedCreator] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [dateRange, setDateRange] = useState<"month" | "custom">("month")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [generating, setGenerating] = useState(false)

  const availableMonths = Object.keys(monthlyData).sort().reverse()

  // Fonction pour obtenir les ventes selon la période sélectionnée
  const getSalesForPeriod = (creator: string) => {
    if (dateRange === "month") {
      const monthData = monthlyData[selectedMonth]
      return monthData ? monthData.salesData.filter((sale) => sale.createur === creator && sale.statut !== "payee") : []
    } else {
      // Période personnalisée
      const startDate = new Date(customStartDate)
      const endDate = new Date(customEndDate)

      return Object.values(monthlyData)
        .flatMap((month) => month.salesData)
        .filter((sale) => {
          const saleDate = new Date(sale.date)
          return saleDate >= startDate && saleDate <= endDate && sale.createur === creator && sale.statut !== "payee"
        })
    }
  }

  // Fonction pour obtenir le stock du créateur
  const getCreatorStock = (creator: string) => {
    return stockData.filter((item) => item.createur === creator)
  }

  const generateReport = (format: "pdf" | "html") => {
    if (!selectedCreator) return

    setGenerating(true)

    try {
      const creatorSales = getSalesForPeriod(selectedCreator)
      const creatorStock = getCreatorStock(selectedCreator)

      if (creatorSales.length === 0 && creatorStock.length === 0) {
        alert("Aucune donnée trouvée pour ce créateur sur cette période")
        return
      }

      // Calculs des ventes
      const totalSales = creatorSales.length
      const totalRevenue = creatorSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
      const totalCommission = creatorSales.reduce((sum, sale) => {
        const price = Number.parseFloat(sale.prix || "0")
        const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
        return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
      }, 0)
      const netAmount = totalRevenue - totalCommission

      // Calculs du stock
      const totalStockItems = creatorStock.length
      const totalStockValue = creatorStock.reduce(
        (sum, item) => sum + Number.parseFloat(item.price) * Number.parseInt(item.quantity),
        0,
      )
      const lowStockItems = creatorStock.filter(
        (item) => Number.parseInt(item.quantity) <= Number.parseInt(item.lowStockThreshold || "0"),
      )
      const outOfStockItems = creatorStock.filter((item) => Number.parseInt(item.quantity) === 0)

      // Obtenir le label de période
      const getPeriodLabel = () => {
        if (dateRange === "month") {
          return new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
        } else {
          return `${new Date(customStartDate).toLocaleDateString("fr-FR")} - ${new Date(customEndDate).toLocaleDateString("fr-FR")}`
        }
      }

      // Générer le contenu HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rapport complet - ${selectedCreator}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .shop-name { font-size: 24px; font-weight: bold; color: #2563eb; }
            .report-title { font-size: 20px; margin: 10px 0; }
            .period { color: #666; }
            .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
            .summary-card { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
            .summary-label { font-size: 14px; color: #666; margin-bottom: 5px; }
            .summary-value { font-size: 24px; font-weight: bold; }
            .positive { color: #16a34a; }
            .negative { color: #dc2626; }
            .warning { color: #ea580c; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background: #f8fafc; font-weight: bold; }
            .amount { text-align: right; font-weight: bold; }
            .commission { color: #dc2626; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
            .section { margin: 40px 0; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #2563eb; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .stock-status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .stock-available { background: #dcfce7; color: #166534; }
            .stock-low { background: #fef3c7; color: #92400e; }
            .stock-out { background: #fecaca; color: #991b1b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="shop-name">${settings.shopName}</div>
            <div class="report-title">Rapport complet</div>
            <div class="period">
              ${selectedCreator} - ${getPeriodLabel()}
            </div>
          </div>

          <!-- Résumé des ventes -->
          <div class="section">
            <div class="section-title">📊 Résumé des ventes</div>
            <div class="summary">
              <div class="summary-card">
                <div class="summary-label">Nombre de ventes</div>
                <div class="summary-value">${totalSales}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Chiffre d'affaires brut</div>
                <div class="summary-value positive">${totalRevenue.toFixed(2)}€</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Commission (${settings.commissionRate}%)</div>
                <div class="summary-value negative">-${totalCommission.toFixed(2)}€</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Net à verser</div>
                <div class="summary-value positive">${netAmount.toFixed(2)}€</div>
              </div>
            </div>
          </div>

          <!-- Résumé du stock -->
          <div class="section">
            <div class="section-title">📦 État du stock (au ${new Date().toLocaleDateString("fr-FR")})</div>
            <div class="summary">
              <div class="summary-card">
                <div class="summary-label">Articles en stock</div>
                <div class="summary-value">${totalStockItems}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Valeur du stock</div>
                <div class="summary-value positive">${totalStockValue.toFixed(2)}€</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Stock bas</div>
                <div class="summary-value warning">${lowStockItems.length}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Ruptures</div>
                <div class="summary-value negative">${outOfStockItems.length}</div>
              </div>
            </div>
          </div>

          ${
            totalSales > 0
              ? `
          <!-- Détail des ventes -->
          <div class="section">
            <div class="section-title">💰 Détail des ventes</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Paiement</th>
                  <th class="amount">Prix</th>
                  <th class="amount">Commission</th>
                  <th class="amount">Net</th>
                </tr>
              </thead>
              <tbody>
                ${creatorSales
                  .map((sale) => {
                    const price = Number.parseFloat(sale.prix || "0")
                    const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                    const commission = isNotCash ? price * (settings.commissionRate / 100) : 0
                    const net = price - commission

                    return `
                      <tr>
                        <td>${new Date(sale.date).toLocaleDateString("fr-FR")}</td>
                        <td>${sale.description}</td>
                        <td>${sale.paiement}</td>
                        <td class="amount">${price.toFixed(2)}€</td>
                        <td class="amount commission">${commission > 0 ? "-" + commission.toFixed(2) + "€" : "0€"}</td>
                        <td class="amount">${net.toFixed(2)}€</td>
                      </tr>
                    `
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          ${
            totalStockItems > 0
              ? `
          <!-- Détail du stock -->
          <div class="section">
            <div class="section-title">📋 Détail du stock</div>
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Catégorie</th>
                  <th class="amount">Prix unitaire</th>
                  <th class="amount">Quantité</th>
                  <th class="amount">Valeur</th>
                  <th>Statut</th>
                  <th>SKU</th>
                </tr>
              </thead>
              <tbody>
                ${creatorStock
                  .map((item) => {
                    const quantity = Number.parseInt(item.quantity)
                    const price = Number.parseFloat(item.price)
                    const threshold = Number.parseInt(item.lowStockThreshold || "0")
                    const value = quantity * price

                    let status = "Disponible"
                    let statusClass = "stock-available"

                    if (quantity === 0) {
                      status = "Rupture"
                      statusClass = "stock-out"
                    } else if (quantity <= threshold) {
                      status = "Stock bas"
                      statusClass = "stock-low"
                    }

                    return `
                      <tr>
                        <td>${item.article}</td>
                        <td>${item.category}</td>
                        <td class="amount">${price.toFixed(2)}€</td>
                        <td class="amount">${quantity}</td>
                        <td class="amount">${value.toFixed(2)}€</td>
                        <td><span class="stock-status ${statusClass}">${status}</span></td>
                        <td>${item.sku}</td>
                      </tr>
                    `
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          <div class="footer">
            <p>Rapport généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
            <p>${settings.shopName} - ${settings.shopSubtitle}</p>
          </div>
        </body>
        </html>
      `

      if (format === "html") {
        // Ouvrir dans une nouvelle fenêtre pour prévisualisation
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(htmlContent)
          newWindow.document.close()
        }
      } else {
        // Pour PDF, on utilise la fonction d'impression du navigateur
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(htmlContent)
          newWindow.document.close()
          newWindow.print()
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error)
      alert("Erreur lors de la génération du rapport")
    } finally {
      setGenerating(false)
    }
  }

  // Calculer les statistiques pour l'aperçu
  const getPreviewStats = () => {
    if (!selectedCreator) return null

    const creatorSales = getSalesForPeriod(selectedCreator)
    const creatorStock = getCreatorStock(selectedCreator)

    const totalRevenue = creatorSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
    const totalCommission = creatorSales.reduce((sum, sale) => {
      const price = Number.parseFloat(sale.prix || "0")
      const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
      return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
    }, 0)

    const totalStockValue = creatorStock.reduce(
      (sum, item) => sum + Number.parseFloat(item.price) * Number.parseInt(item.quantity),
      0,
    )

    return {
      salesCount: creatorSales.length,
      totalRevenue,
      totalCommission,
      netAmount: totalRevenue - totalCommission,
      stockItems: creatorStock.length,
      stockValue: totalStockValue,
    }
  }

  const previewStats = getPreviewStats()

  const getPeriodLabel = () => {
    if (dateRange === "month") {
      return new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
    } else {
      return `${customStartDate} - ${customEndDate}`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Génération de rapports</h2>
        <p className="text-muted-foreground">Créez des rapports PDF ou HTML complets avec ventes et stock</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Paramètres du rapport
          </CardTitle>
          <CardDescription>Sélectionnez le créateur et la période pour générer le rapport complet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Créateur</Label>
              <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un créateur" />
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

            <div className="space-y-2">
              <Label>Type de période</Label>
              <Select value={dateRange} onValueChange={(value: "month" | "custom") => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Par mois</SelectItem>
                  <SelectItem value="custom">Période personnalisée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {dateRange === "month" ? (
            <div className="space-y-2">
              <Label>Mois</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
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
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
              </div>
            </div>
          )}

          {previewStats && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Aperçu du rapport - {getPeriodLabel()}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Ventes</div>
                    <div className="text-xl font-bold">{previewStats.salesCount}</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">CA Net</div>
                    <div className="text-xl font-bold text-green-600">{previewStats.netAmount.toFixed(2)}€</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Articles stock</div>
                    <div className="text-xl font-bold text-blue-600">{previewStats.stockItems}</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Valeur stock</div>
                    <div className="text-xl font-bold text-purple-600">{previewStats.stockValue.toFixed(2)}€</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">CA Brut</div>
                    <div className="text-xl font-bold">{previewStats.totalRevenue.toFixed(2)}€</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Commission</div>
                    <div className="text-xl font-bold text-red-600">-{previewStats.totalCommission.toFixed(2)}€</div>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-3">
            <Button
              onClick={() => generateReport("html")}
              disabled={
                !selectedCreator || generating || (dateRange === "custom" && (!customStartDate || !customEndDate))
              }
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu HTML
            </Button>
            <Button
              onClick={() => generateReport("pdf")}
              disabled={
                !selectedCreator || generating || (dateRange === "custom" && (!customStartDate || !customEndDate))
              }
            >
              <Download className="h-4 w-4 mr-2" />
              {generating ? "Génération..." : "Générer PDF"}
            </Button>
          </div>

          {!selectedCreator && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>Veuillez sélectionner un créateur pour générer le rapport.</AlertDescription>
            </Alert>
          )}

          {dateRange === "custom" && (!customStartDate || !customEndDate) && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Veuillez sélectionner une date de début et de fin pour la période personnalisée.
              </AlertDescription>
            </Alert>
          )}

          {selectedCreator && previewStats?.salesCount === 0 && previewStats?.stockItems === 0 && (
            <Alert>
              <AlertDescription>Aucune donnée trouvée pour ce créateur sur cette période.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
