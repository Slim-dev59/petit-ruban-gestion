"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Download, Eye } from "lucide-react"
import { useStore } from "@/lib/store"
import { formatCurrency, parsePrice } from "@/lib/sales-utils"

export function PDFGenerator() {
  const { creators, getSalesForCreator, getStockForCreator, settings } = useStore()
  const [selectedCreator, setSelectedCreator] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [generating, setGenerating] = useState(false)

  const generatePDFContent = (creator: string) => {
    const sales = getSalesForCreator(creator)
    const stock = getStockForCreator(creator)

    // Filtrer les ventes par date si spécifié
    const filteredSales = sales.filter((sale) => {
      if (!startDate && !endDate) return true

      try {
        const saleDate = new Date(sale.date)
        const start = startDate ? new Date(startDate) : new Date("1900-01-01")
        const end = endDate ? new Date(endDate) : new Date("2100-12-31")

        return saleDate >= start && saleDate <= end
      } catch (error) {
        return true
      }
    })

    const totalSales = filteredSales.reduce((sum, sale) => sum + parsePrice(sale.prix), 0)
    const totalCommission = filteredSales.reduce((sum, sale) => {
      const price = parsePrice(sale.prix)
      const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
      return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
    }, 0)
    const netAmount = totalSales - totalCommission

    const currentDate = new Date().toLocaleDateString("fr-FR")
    const periodText = startDate && endDate ? `du ${startDate} au ${endDate}` : "Toutes les ventes"

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de ventes - ${creator}</title>
    <style>
        @page {
            margin: 20mm;
            size: A4;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        
        .header h2 {
            color: #64748b;
            margin: 5px 0;
            font-size: 20px;
            font-weight: normal;
        }
        
        .header .period {
            color: #64748b;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .summary-box {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
        }
        
        .summary-item {
            text-align: center;
        }
        
        .summary-item .label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
        }
        
        .summary-item.ca .value {
            color: #059669;
        }
        
        .summary-item.commission .value {
            color: #dc2626;
        }
        
        .summary-item.net .value {
            color: #2563eb;
        }
        
        .section {
            margin: 30px 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        th {
            background: #2563eb;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
        }
        
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        .amount {
            text-align: right;
            font-weight: 600;
        }
        
        .payment-method {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }
        
        .payment-cash {
            background: #dcfce7;
            color: #166534;
        }
        
        .payment-card {
            background: #dbeafe;
            color: #1d4ed8;
        }
        
        .payment-other {
            background: #f3e8ff;
            color: #7c3aed;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
        
        .no-data {
            text-align: center;
            color: #64748b;
            font-style: italic;
            padding: 20px;
        }
        
        @media print {
            .no-print {
                display: none;
            }
            
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${settings.shopName}</h1>
        <h2>Rapport de ventes - ${creator}</h2>
        <div class="period">${periodText} • Généré le ${currentDate}</div>
    </div>
    
    <div class="summary-box">
        <div class="summary-item ca">
            <div class="label">Chiffre d'affaires</div>
            <div class="value">${totalSales.toFixed(2)}€</div>
        </div>
        <div class="summary-item commission">
            <div class="label">Commission (${settings.commissionRate}%)</div>
            <div class="value">-${totalCommission.toFixed(2)}€</div>
        </div>
        <div class="summary-item net">
            <div class="label">Solde à verser</div>
            <div class="value">${netAmount.toFixed(2)}€</div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">📊 Détail des ventes (${filteredSales.length})</div>
        ${
          filteredSales.length > 0
            ? `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Article</th>
                    <th>Prix</th>
                    <th>Mode de paiement</th>
                    <th>Commission</th>
                    <th>Net</th>
                </tr>
            </thead>
            <tbody>
                ${filteredSales
                  .map((sale) => {
                    const price = parsePrice(sale.prix)
                    const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                    const commission = isNotCash ? price * (settings.commissionRate / 100) : 0
                    const net = price - commission

                    const paymentClass = isNotCash
                      ? sale.paiement?.toLowerCase().includes("carte")
                        ? "payment-card"
                        : "payment-other"
                      : "payment-cash"

                    return `
                    <tr>
                        <td>${sale.date}</td>
                        <td>${sale.description}</td>
                        <td class="amount">${price.toFixed(2)}€</td>
                        <td><span class="payment-method ${paymentClass}">${sale.paiement}</span></td>
                        <td class="amount">${commission > 0 ? commission.toFixed(2) + "€" : "-"}</td>
                        <td class="amount">${net.toFixed(2)}€</td>
                    </tr>
                    `
                  })
                  .join("")}
            </tbody>
        </table>
        `
            : '<div class="no-data">Aucune vente pour cette période</div>'
        }
    </div>
    
    <div class="footer">
        <p>Rapport généré automatiquement par ${settings.shopName}</p>
        <p>Commission de ${settings.commissionRate}% appliquée sur tous les paiements sauf espèces</p>
    </div>
</body>
</html>
    `
  }

  const generatePDF = async () => {
    if (!selectedCreator) return

    setGenerating(true)

    try {
      const htmlContent = generatePDFContent(selectedCreator)

      // Créer et télécharger le fichier HTML
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `rapport_${selectedCreator}_${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
      }
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error)
    } finally {
      setGenerating(false)
    }
  }

  const previewPDF = () => {
    if (!selectedCreator) return

    const htmlContent = generatePDFContent(selectedCreator)
    const previewWindow = window.open("", "_blank", "width=800,height=600")
    if (previewWindow) {
      previewWindow.document.write(htmlContent)
      previewWindow.document.close()
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Génération de Rapports</h2>
          <p className="text-gray-600">Générez des rapports détaillés pour chaque créateur</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Génération de rapports PDF
          </CardTitle>
          <CardDescription>Générez des rapports détaillés et professionnels pour chaque créateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Date de début (optionnel)</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Date de fin (optionnel)</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={previewPDF}
              disabled={!selectedCreator}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={generatePDF} disabled={!selectedCreator || generating} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              {generating ? "Génération..." : "Générer PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu des créateurs */}
      {creators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu des créateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator) => {
                const sales = getSalesForCreator(creator)
                const totalSales = sales.reduce((sum, sale) => sum + parsePrice(sale.prix), 0)
                const totalCommission = sales.reduce((sum, sale) => {
                  const price = parsePrice(sale.prix)
                  const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                  return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
                }, 0)

                return (
                  <div key={creator} className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">{creator}</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{sales.length} ventes</p>
                      <p>CA: {formatCurrency(totalSales)}</p>
                      <p>Commission: {formatCurrency(totalCommission)}</p>
                      <p className="font-medium text-green-600">
                        À verser: {formatCurrency(totalSales - totalCommission)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 bg-transparent"
                      onClick={() => {
                        setSelectedCreator(creator)
                        previewPDF()
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Aperçu
                    </Button>
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
