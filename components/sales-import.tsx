"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, AlertTriangle, Calendar } from "lucide-react"
import { useStore } from "@/lib/store"

interface PendingSale {
  index: number
  date: string
  type: string
  reference: string
  paymentMethod: string
  quantity: string
  description: string
  currency: string
  priceBeforeDiscount: string
  discount: string
  finalPrice: string
  suggestedCreator: string
  needsValidation: boolean
  confidence: number
  matchedItem?: string
  commission: number
  month: string // Nouveau champ pour le mois
}

export function SalesImport() {
  const [salesFile, setSalesFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [pendingSales, setPendingSales] = useState<PendingSale[]>([])
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(
    null,
  )
  const [showNewCreatorDialog, setShowNewCreatorDialog] = useState(false)
  const [newCreatorName, setNewCreatorName] = useState("")

  const { creators, stockData, importSalesData, addCreator, settings } = useStore()

  // Fonction pour parser la date française
  const parseDate = (dateStr: string): { date: Date; month: string } => {
    try {
      // Format: "12 sept. 2025 09:37"
      const months = {
        janv: "01",
        févr: "02",
        mars: "03",
        avr: "04",
        mai: "05",
        juin: "06",
        juil: "07",
        août: "08",
        sept: "09",
        oct: "10",
        nov: "11",
        déc: "12",
      }

      const parts = dateStr.split(" ")
      const day = parts[0].padStart(2, "0")
      const monthName = parts[1].replace(".", "")
      const year = parts[2]
      const time = parts[3] || "00:00"

      const monthNum = months[monthName as keyof typeof months] || "01"
      const isoDate = `${year}-${monthNum}-${day}T${time}:00`
      const date = new Date(isoDate)
      const month = `${year}-${monthNum}`

      return { date, month }
    } catch (error) {
      console.error("Erreur parsing date:", dateStr, error)
      return { date: new Date(), month: new Date().toISOString().slice(0, 7) }
    }
  }

  // Fonction pour trouver le créateur basé sur le stock
  const findCreatorFromStock = (description: string): { creator: string; confidence: number; matchedItem?: string } => {
    const descLower = description.toLowerCase().trim()

    console.log(`Recherche pour: "${description}"`)

    // Chercher une correspondance exacte dans le stock
    for (const item of stockData) {
      const itemNameLower = item.article.toLowerCase().trim()

      // Correspondance exacte
      if (descLower === itemNameLower) {
        console.log(`Match exact trouvé: ${item.article} -> ${item.createur}`)
        return { creator: item.createur, confidence: 1.0, matchedItem: item.article }
      }

      // Correspondance partielle (contient)
      if (descLower.includes(itemNameLower) || itemNameLower.includes(descLower)) {
        console.log(`Match partiel trouvé: ${item.article} -> ${item.createur}`)
        return { creator: item.createur, confidence: 0.8, matchedItem: item.article }
      }
    }

    // Si aucune correspondance dans le stock, essayer avec les créateurs existants
    for (const creator of creators) {
      const creatorLower = creator.toLowerCase()
      if (descLower.includes(creatorLower)) {
        console.log(`Match créateur trouvé: ${creator}`)
        return { creator, confidence: 0.6 }
      }
    }

    console.log(`Aucun match trouvé pour: ${description}`)
    return { creator: "Non identifié", confidence: 0 }
  }

  // Fonction pour calculer la commission
  const calculateCommission = (price: number, paymentMethod: string): number => {
    const isNotCash =
      !paymentMethod.toLowerCase().includes("espèce") &&
      !paymentMethod.toLowerCase().includes("cash") &&
      !paymentMethod.toLowerCase().includes("liquide")

    return isNotCash ? price * (settings.commissionRate / 100) : 0
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("Headers du fichier de ventes:", headers)

    return lines
      .slice(1)
      .map((line) => {
        // Parsing CSV amélioré
        const values: string[] = []
        let current = ""
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === "," && !inQuotes) {
            values.push(current.trim())
            current = ""
          } else {
            current += char
          }
        }
        values.push(current.trim())

        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ""
        })
        return obj
      })
      .filter((row) => Object.values(row).some((val) => val !== ""))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSalesFile(file)
    }
  }

  const handleImport = async () => {
    if (!salesFile) {
      setImportStatus({ type: "error", message: "Veuillez sélectionner le fichier de ventes" })
      return
    }

    setImporting(true)
    setImportStatus(null)

    try {
      const salesText = await salesFile.text()
      const salesData = parseCSV(salesText)

      console.log("Données ventes brutes:", salesData.slice(0, 3))
      console.log("Stock disponible:", stockData.length, "articles")

      // Analyser chaque vente
      const pending: PendingSale[] = salesData
        .filter((row) => row["Type"] === "Vente") // Filtrer uniquement les ventes
        .map((row, index) => {
          const dateStr = row["Date"] || ""
          const { date, month } = parseDate(dateStr)
          const type = row["Type"] || ""
          const reference = row["Réf. transaction"] || ""
          const paymentMethod = row["Moyen de paiement"] || ""
          const quantity = row["Quantité"] || "1"
          const description = row["Description"] || ""
          const currency = row["Devise"] || "EUR"
          const priceBeforeDiscount = row["Prix avant réduction"] || "0"
          const discount = row["Réduction"] || "0"
          const finalPrice = row["Prix (TTC)"] || "0"

          const price = Number.parseFloat(finalPrice) || 0
          const commission = calculateCommission(price, paymentMethod)

          const { creator, confidence, matchedItem } = findCreatorFromStock(description)
          const needsValidation = confidence < 0.8 || creator === "Non identifié"

          return {
            index,
            date: date.toISOString(),
            type,
            reference,
            paymentMethod,
            quantity,
            description,
            currency,
            priceBeforeDiscount,
            discount,
            finalPrice,
            suggestedCreator: creator,
            needsValidation,
            confidence,
            matchedItem,
            commission,
            month,
          }
        })

      setPendingSales(pending)

      // Statistiques
      const needsValidationCount = pending.filter((sale) => sale.needsValidation).length
      const autoAssignedCount = pending.length - needsValidationCount
      const unknownCount = pending.filter((sale) => sale.suggestedCreator === "Non identifié").length
      const monthsFound = [...new Set(pending.map((sale) => sale.month))].sort()

      setImportStatus({
        type: needsValidationCount > 0 ? "warning" : "success",
        message: `${pending.length} ventes analysées sur ${monthsFound.length} mois (${monthsFound.join(", ")}). ${autoAssignedCount} assignées automatiquement, ${needsValidationCount} nécessitent une validation. ${unknownCount} non identifiées.`,
      })
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      setImportStatus({
        type: "error",
        message: "Erreur lors de l'analyse du fichier",
      })
    } finally {
      setImporting(false)
    }
  }

  const updateCreatorAssignment = (index: number, creator: string) => {
    setPendingSales((prev) =>
      prev.map((sale) =>
        sale.index === index ? { ...sale, suggestedCreator: creator, needsValidation: false } : sale,
      ),
    )
  }

  const handleCreateNewCreator = () => {
    if (newCreatorName.trim()) {
      addCreator(newCreatorName.trim())
      setNewCreatorName("")
      setShowNewCreatorDialog(false)
    }
  }

  const confirmImport = () => {
    const validSales = pendingSales.filter((sale) => sale.suggestedCreator !== "Non identifié")

    // Grouper par mois
    const salesByMonth = validSales.reduce(
      (acc, sale) => {
        if (!acc[sale.month]) acc[sale.month] = []
        acc[sale.month].push({
          date: sale.date,
          description: sale.description,
          prix: sale.finalPrice,
          paiement: sale.paymentMethod,
          createur: sale.suggestedCreator,
          quantity: sale.quantity,
          commission: sale.commission.toFixed(2),
        })
        return acc
      },
      {} as Record<string, any[]>,
    )

    // Importer pour chaque mois
    Object.entries(salesByMonth).forEach(([month, sales]) => {
      console.log(`Import de ${sales.length} ventes pour ${month}`)
      importSalesData(sales, month)
    })

    setPendingSales([])
    setImportStatus({
      type: "success",
      message: `${validSales.length} ventes importées avec succès dans ${Object.keys(salesByMonth).length} mois !`,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import des ventes
          </CardTitle>
          <CardDescription>
            Les ventes seront automatiquement attribuées aux créateurs basé sur le stock importé. Commission de{" "}
            {settings.commissionRate}% appliquée sur les paiements non-espèces.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sales-file">Fichier de ventes (CSV)</Label>
            <div className="flex items-center gap-2">
              <Input id="sales-file" type="file" accept=".csv" onChange={handleFileChange} />
              {salesFile && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>

          <Button
            onClick={handleImport}
            disabled={!salesFile || importing || stockData.length === 0}
            className="w-full"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {importing ? "Analyse en cours..." : "Analyser les ventes"}
          </Button>

          {stockData.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Veuillez d'abord importer le stock pour permettre l'attribution automatique.
              </AlertDescription>
            </Alert>
          )}

          {importStatus && (
            <Alert variant={importStatus.type === "error" ? "destructive" : "default"}>
              {importStatus.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : importStatus.type === "warning" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription>{importStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {pendingSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Validation des ventes</span>
              <Button
                onClick={confirmImport}
                disabled={pendingSales.some((sale) => sale.suggestedCreator === "Non identifié")}
              >
                Confirmer l'import ({pendingSales.filter((sale) => sale.suggestedCreator !== "Non identifié").length}{" "}
                ventes)
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSales.map((sale) => (
                  <TableRow key={sale.index} className={sale.needsValidation ? "bg-yellow-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{new Date(sale.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {sale.month}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate" title={sale.description}>
                        {sale.description}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{sale.finalPrice}€</TableCell>
                    <TableCell>
                      <Badge variant={sale.paymentMethod.toLowerCase().includes("espèce") ? "secondary" : "default"}>
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sale.commission > 0 ? (
                        <span className="text-red-600">-{sale.commission.toFixed(2)}€</span>
                      ) : (
                        <span className="text-green-600">0€</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sale.suggestedCreator}
                        onValueChange={(value) => updateCreatorAssignment(sale.index, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Non identifié">Non identifié</SelectItem>
                          {creators.map((creator) => (
                            <SelectItem key={creator} value={creator}>
                              {creator}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {sale.matchedItem && (
                        <Badge variant="outline" className="text-xs">
                          {sale.matchedItem}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {sale.suggestedCreator === "Non identifié" ? (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Non identifié
                        </Badge>
                      ) : sale.needsValidation ? (
                        <Badge variant="secondary">
                          <AlertTriangle className="h-3 w-3 mr-1" />À valider
                        </Badge>
                      ) : sale.confidence >= 0.9 ? (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      ) : (
                        <Badge variant="outline">Suggéré ({Math.round(sale.confidence * 100)}%)</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showNewCreatorDialog} onOpenChange={setShowNewCreatorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau créateur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau créateur à la liste pour pouvoir l'assigner aux ventes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-creator">Nom du créateur</Label>
              <Input
                id="new-creator"
                value={newCreatorName}
                onChange={(e) => setNewCreatorName(e.target.value)}
                placeholder="Nom du nouveau créateur"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewCreatorDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateNewCreator} disabled={!newCreatorName.trim()}>
              Créer le créateur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
