"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Eye, Settings } from "lucide-react"
import { useStore } from "@/lib/store"

interface InvoiceSettings {
  invoiceNumber: string
  invoiceDate: string
  paymentConditions: string
  paymentMethods: string
  rib: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string
}

export function RentInvoiceGenerator() {
  const { creators, settings, monthlyData, currentMonth } = useStore()
  const [selectedCreator, setSelectedCreator] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [generating, setGenerating] = useState(false)

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    invoiceNumber: `FACT-${new Date().getFullYear()}-001`,
    invoiceDate: new Date().toISOString().split("T")[0],
    paymentConditions: "Paiement à réception de facture",
    paymentMethods: "Virement bancaire, Chèque, Espèces",
    rib: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
    companyName: settings.shopName,
    companyAddress: "123 Rue de la Boutique\n75001 Paris",
    companyPhone: "01 23 45 67 89",
    companyEmail: "contact@boutique.fr",
  })

  const availableMonths = Object.keys(monthlyData).sort().reverse()

  const getParticipationForCreator = () => {
    if (!selectedCreator || !selectedMonth) return null
    const monthData = monthlyData[selectedMonth]
    if (!monthData) return null
    return monthData.participations.find((p) => p.createur === selectedCreator)
  }

  const generateInvoice = (format: "pdf" | "html") => {
    if (!selectedCreator) return

    setGenerating(true)

    try {
      const participation = getParticipationForCreator()
      if (!participation) {
        alert("Aucune participation trouvée pour ce créateur ce mois-ci")
        return
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Facture - ${participation.createur}</title>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 20mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: 'Arial', sans-serif;
              color: #2c3e50;
              line-height: 1.6;
              font-size: 11pt;
            }
            .container {
              max-width: 170mm;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 4px solid #3498db;
            }
            .company-info h1 {
              color: #3498db;
              font-size: 22pt;
              margin-bottom: 10px;
              font-weight: 700;
            }
            .company-info p {
              color: #7f8c8d;
              font-size: 9pt;
              line-height: 1.4;
            }
            .invoice-info {
              text-align: right;
            }
            .invoice-number {
              font-size: 16pt;
              font-weight: 700;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            .invoice-date {
              color: #7f8c8d;
              font-size: 9pt;
            }
            .parties {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 40px;
            }
            .party-box {
              background: #ecf0f1;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3498db;
            }
            .party-title {
              font-size: 10pt;
              color: #7f8c8d;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .party-name {
              font-size: 13pt;
              font-weight: 700;
              color: #2c3e50;
              margin-bottom: 8px;
            }
            .details-section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 12pt;
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 15px;
              padding-bottom: 8px;
              border-bottom: 2px solid #ecf0f1;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            thead {
              background: #3498db;
              color: white;
            }
            th {
              padding: 15px;
              text-align: left;
              font-weight: 600;
              font-size: 10pt;
            }
            td {
              padding: 15px;
              border-bottom: 1px solid #ecf0f1;
            }
            .text-right {
              text-align: right;
            }
            .total-section {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 25px;
              border-radius: 12px;
              margin-bottom: 30px;
            }
            .total-label {
              font-size: 11pt;
              opacity: 0.9;
              margin-bottom: 8px;
            }
            .total-amount {
              font-size: 28pt;
              font-weight: 700;
            }
            .payment-info {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .payment-info h3 {
              font-size: 11pt;
              color: #2c3e50;
              margin-bottom: 12px;
              font-weight: 600;
            }
            .payment-info p {
              font-size: 9pt;
              color: #7f8c8d;
              margin-bottom: 8px;
              line-height: 1.6;
            }
            .rib-box {
              background: white;
              padding: 15px;
              border: 2px dashed #3498db;
              border-radius: 6px;
              margin-top: 15px;
              font-family: 'Courier New', monospace;
              font-size: 10pt;
              text-align: center;
              font-weight: 600;
              color: #2c3e50;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ecf0f1;
              text-align: center;
              font-size: 8pt;
              color: #95a5a6;
            }
            @media print {
              body { 
                background: white;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-info">
                <h1>${invoiceSettings.companyName}</h1>
                <p>${invoiceSettings.companyAddress.replace(/\n/g, "<br>")}</p>
                <p>Tél: ${invoiceSettings.companyPhone}</p>
                <p>Email: ${invoiceSettings.companyEmail}</p>
              </div>
              <div class="invoice-info">
                <div class="invoice-number">FACTURE</div>
                <div class="invoice-number">${invoiceSettings.invoiceNumber}</div>
                <div class="invoice-date">Date: ${new Date(invoiceSettings.invoiceDate).toLocaleDateString("fr-FR")}</div>
              </div>
            </div>

            <div class="parties">
              <div class="party-box">
                <div class="party-title">Émetteur</div>
                <div class="party-name">${invoiceSettings.companyName}</div>
              </div>
              <div class="party-box">
                <div class="party-title">Client</div>
                <div class="party-name">${participation.createur}</div>
              </div>
            </div>

            <div class="details-section">
              <div class="section-title">Détail de la prestation</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Période</th>
                    <th class="text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Participation mensuelle - Espace de vente</td>
                    <td>${new Date(participation.mois + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}</td>
                    <td class="text-right" style="font-weight: 600;">${participation.montantLoyer.toFixed(2)} €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-section">
              <div class="total-label">TOTAL À PAYER</div>
              <div class="total-amount">${participation.montantLoyer.toFixed(2)} €</div>
            </div>

            <div class="payment-info">
              <h3>💳 Conditions et modalités de paiement</h3>
              <p><strong>Conditions:</strong> ${invoiceSettings.paymentConditions}</p>
              <p><strong>Moyens de paiement acceptés:</strong> ${invoiceSettings.paymentMethods}</p>
              <div class="rib-box">
                ${invoiceSettings.rib}
              </div>
            </div>

            <div class="footer">
              <p>Facture générée le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
              <p>${invoiceSettings.companyName} - ${invoiceSettings.companyEmail}</p>
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
      console.error("Erreur:", error)
      alert("Erreur lors de la génération")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Facturation des loyers</h2>
        <p className="text-muted-foreground">Générez des factures professionnelles au format A4</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration de la facture
          </CardTitle>
          <CardDescription>Personnalisez les informations de votre facture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Numéro de facture</Label>
              <Input
                value={invoiceSettings.invoiceNumber}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoiceNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de facture</Label>
              <Input
                type="date"
                value={invoiceSettings.invoiceDate}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoiceDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom de l'entreprise</Label>
              <Input
                value={invoiceSettings.companyName}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={invoiceSettings.companyEmail}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, companyEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Textarea
                value={invoiceSettings.companyAddress}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, companyAddress: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={invoiceSettings.companyPhone}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, companyPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Conditions de paiement</Label>
            <Input
              value={invoiceSettings.paymentConditions}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, paymentConditions: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Modalités de paiement acceptées</Label>
            <Input
              value={invoiceSettings.paymentMethods}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, paymentMethods: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>RIB</Label>
            <Input
              value={invoiceSettings.rib}
              onChange={(e) => setInvoiceSettings({ ...invoiceSettings, rib: e.target.value })}
              placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générer la facture
          </CardTitle>
          <CardDescription>Sélectionnez le créateur et le mois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Créateur</Label>
              <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
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
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={() => generateInvoice("html")} disabled={!selectedCreator || generating} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={() => generateInvoice("pdf")} disabled={!selectedCreator || generating}>
              <Download className="h-4 w-4 mr-2" />
              {generating ? "Génération..." : "Imprimer PDF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
