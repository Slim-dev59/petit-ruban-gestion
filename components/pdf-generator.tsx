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

  const getSalesForPeriod = (creator: string) => {
    if (dateRange === "month") {
      const monthData = monthlyData[selectedMonth]
      return monthData ? monthData.salesData.filter((sale) => sale.createur === creator && sale.statut !== "payee") : []
    } else {
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

      const totalSales = creatorSales.length
      const totalRevenue = creatorSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
      const totalCommission = creatorSales.reduce((sum, sale) => {
        const price = Number.parseFloat(sale.prix || "0")
        const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
        return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
      }, 0)
      const netAmount = totalRevenue - totalCommission

      const totalStockItems = creatorStock.length
      const totalStockValue = creatorStock.reduce(
        (sum, item) => sum + Number.parseFloat(item.price) * Number.parseInt(item.quantity),
        0,
      )

      const getPeriodLabel = () => {
        if (dateRange === "month") {
          return new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
        } else {
          return `${new Date(customStartDate).toLocaleDateString("fr-FR")} - ${new Date(customEndDate).toLocaleDateString("fr-FR")}`
        }
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rapport - ${selectedCreator}</title>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 15mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              color: #1a1a1a;
              line-height: 1.6;
              font-size: 10pt;
              background: white;
            }
            .container {
              max-width: 180mm;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #3b82f6;
            }
            .header-left h1 {
              font-size: 24pt;
              color: #3b82f6;
              font-weight: 700;
              margin-bottom: 5px;
            }
            .header-left p {
              color: #6b7280;
              font-size: 9pt;
            }
            .header-right {
              text-align: right;
            }
            .header-right .creator-name {
              font-size: 16pt;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 5px;
            }
            .header-right .period {
              color: #6b7280;
              font-size: 9pt;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              border-radius: 12px;
              color: white;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .summary-card.green {
              background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
            }
            .summary-card.orange {
              background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            }
            .summary-card.blue {
              background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
            }
            .summary-label {
              font-size: 8pt;
              opacity: 0.9;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .summary-value {
              font-size: 20pt;
              font-weight: 700;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 14pt;
              font-weight: 600;
              color: #1a1a1a;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e5e7eb;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 9pt;
            }
            thead {
              background: #f9fafb;
            }
            th {
              text-align: left;
              padding: 12px 8px;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 10px 8px;
              border-bottom: 1px solid #f3f4f6;
            }
            tbody tr:hover {
              background: #f9fafb;
            }
            .text-right {
              text-align: right;
            }
            .amount {
              font-weight: 600;
              font-variant-numeric: tabular-nums;
            }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 8pt;
              color: #9ca3af;
            }
            @media print {
              body { 
                background: white;
              }
              .summary-card {
                break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-left">
                <h1>${settings.shopName}</h1>
                <p>${settings.shopSubtitle}</p>
              </div>
              <div class="header-right">
                <div class="creator-name">${selectedCreator}</div>
                <div class="period">${getPeriodLabel()}</div>
              </div>
            </div>

            <div class="summary-grid">
              <div class="summary-card blue">
                <div class="summary-label">Ventes</div>
                <div class="summary-value">${totalSales}</div>
              </div>
              <div class="summary-card green">
                <div class="summary-label">Net à verser</div>
                <div class="summary-value">${netAmount.toFixed(2)}€</div>
              </div>
              <div class="summary-card orange">
                <div class="summary-label">Articles en stock</div>
                <div class="summary-value">${totalStockItems}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Valeur stock</div>
                <div class="summary-value">${totalStockValue.toFixed(2)}€</div>
              </div>
            </div>

            ${
              totalSales > 0
                ? `
            <div class="section">
              <div class="section-title">💰 Détail des ventes</div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Paiement</th>
                    <th class="text-right">Prix</th>
                    <th class="text-right">Commission</th>
                    <th class="text-right">Net</th>
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
                          <td class="text-right amount">${price.toFixed(2)}€</td>
                          <td class="text-right amount negative">${commission > 0 ? "-" + commission.toFixed(2) + "€" : "0€"}</td>
                          <td class="text-right amount positive">${net.toFixed(2)}€</td>
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
            <div class="section">
              <div class="section-title">📦 Inventaire</div>
              <table>
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Catégorie</th>
                    <th class="text-right">Prix</th>
                    <th class="text-right">Quantité</th>
                    <th class="text-right">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  ${creatorStock
                    .map((item) => {
                      const quantity = Number.parseInt(item.quantity)
                      const price = Number.parseFloat(item.price)
                      const value = quantity * price

                      return `
                        <tr>
                          <td>${item.article}</td>
                          <td>${item.category}</td>
                          <td class="text-right amount">${price.toFixed(2)}€</td>
                          <td class="text-right">${quantity}</td>
                          <td class="text-right amount">${value.toFixed(2)}€</td>
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
              <p>Document généré le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
              <p>${settings.shopName}</p>
            </div>
          </div>
        </body>
        </html>
      `

      if (format === "html") {
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(htmlContent)
          newWindow.document.close()
        }
      } else {
        const newWindow = window.open("", "_blank")
        if (newWindow) {
          newWindow.document.write(htmlContent)
          newWindow.document.close()
          setTimeout(() => newWindow.print(), 250)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la génération:", error)
      alert("Erreur lors de la génération du rapport")
    } finally {
      setGenerating(false)
    }
  }

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
        <p className="text-muted-foreground">Créez des rapports PDF élégants au format A4</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Paramètres du rapport
          </CardTitle>
          <CardDescription>Sélectionnez le créateur et la période</CardDescription>
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
                  Aperçu - {getPeriodLabel()}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Ventes</div>
                    <div className="text-xl font-bold">{previewStats.salesCount}</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Net à verser</div>
                    <div className="text-xl font-bold text-green-600">{previewStats.netAmount.toFixed(2)}€</div>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-sm text-muted-foreground">Articles stock</div>
                    <div className="text-xl font-bold text-blue-600">{previewStats.stockItems}</div>
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
              Aperçu
            </Button>
            <Button
              onClick={() => generateReport("pdf")}
              disabled={
                !selectedCreator || generating || (dateRange === "custom" && (!customStartDate || !customEndDate))
              }
            >
              <Download className="h-4 w-4 mr-2" />
              {generating ? "Génération..." : "Imprimer PDF"}
            </Button>
          </div>

          {!selectedCreator && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>Veuillez sélectionner un créateur.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
