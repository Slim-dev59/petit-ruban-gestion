"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, AlertTriangle, Calendar, X, Trash2 } from "lucide-react"
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
  month: string
  isAssigned: boolean
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

  const {
    creators,
    stockData,
    importSalesData,
    addCreator,
    settings,
    getPendingSales,
    addPendingSales,
    updatePendingSale,
    removePendingSale,
    clearPendingSales,
    currentMonth,
  } = useStore()

  // Charger les ventes en attente au montage du composant
  useEffect(() => {
    const existingPendingSales = getPendingSales()
    if (existingPendingSales.length > 0) {
      // Convertir les PendingSale du store vers le format local
      const convertedSales: PendingSale[] = existingPendingSales.map((sale, index) => ({
        index: index,
        date: sale.date,
        type: "Vente",
        reference: `REF-${index}`,
        paymentMethod: sale.paiement,
        quantity: sale.quantity || "1",
        description: sale.description,
        currency: "EUR",
        priceBeforeDiscount: sale.prix,
        discount: "0",
        finalPrice: sale.prix,
        suggestedCreator: sale.suggestedCreator || "Non identifié",
        needsValidation: sale.needsValidation,
        confidence: sale.confidence || 0,
        matchedItem: sale.matchedItem,
        commission: Number.parseFloat(sale.commission || "0"),
        month: sale.month,
        isAssigned: sale.suggestedCreator !== "Non identifié" && sale.suggestedCreator !== undefined,
      }))
      setPendingSales(convertedSales)
    }
  }, [])

  // Fonction pour parser la date française
  const parseDate = (dateStr: string): { date: Date; month: string } => {
    try {
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

  // Fonction améliorée pour trouver le créateur basé sur le stock
  const findCreatorFromStock = (description: string): { creator: string; confidence: number; matchedItem?: string } => {
    const descLower = description.toLowerCase().trim()
    console.log(`🔍 Recherche pour: "${description}"`)

    // 1. Recherche exacte dans les variations (articles) avec vérification du créateur
    for (const item of stockData) {
      const articleLower = item.article.toLowerCase().trim()
      const createurLower = item.createur.toLowerCase().trim()

      // Correspondance exacte de l'article
      if (descLower === articleLower) {
        console.log(`✅ Match exact article: "${item.article}" -> ${item.createur}`)
        return { creator: item.createur, confidence: 1.0, matchedItem: item.article }
      }

      // Vérifier si la description contient le nom du créateur ET l'article
      if (descLower.includes(createurLower) && descLower.includes(articleLower)) {
        console.log(`✅ Match créateur + article: "${item.createur}" + "${item.article}"`)
        return { creator: item.createur, confidence: 0.95, matchedItem: `${item.createur} - ${item.article}` }
      }
    }

    // 2. Recherche par créateur spécifique dans la description
    for (const item of stockData) {
      const createurLower = item.createur.toLowerCase().trim()

      // Vérifier si la description commence par le nom du créateur
      if (descLower.startsWith(createurLower)) {
        console.log(`✅ Match début créateur: "${item.createur}" au début de "${description}"`)
        return { creator: item.createur, confidence: 0.9, matchedItem: `Créateur: ${item.createur}` }
      }

      // Vérifier si le nom du créateur est dans la description (avec espaces)
      if (descLower.includes(` ${createurLower} `) || descLower.includes(`${createurLower} `)) {
        console.log(`✅ Match créateur isolé: "${item.createur}" dans "${description}"`)
        return { creator: item.createur, confidence: 0.85, matchedItem: `Créateur: ${item.createur}` }
      }
    }

    // 3. Recherche partielle dans les articles avec vérification stricte
    for (const item of stockData) {
      const articleLower = item.article.toLowerCase().trim()
      const createurLower = item.createur.toLowerCase().trim()

      // Éviter les correspondances trop courtes ou ambiguës
      if (articleLower.length > 4) {
        if (descLower.includes(articleLower)) {
          // Vérifier que ce n'est pas un autre créateur qui contient cet article
          const otherCreatorMatch = stockData.find(
            (otherItem) =>
              otherItem.createur !== item.createur && otherItem.article.toLowerCase().includes(articleLower),
          )

          if (!otherCreatorMatch) {
            console.log(`🔍 Match partiel article unique: "${item.article}" -> ${item.createur}`)
            return { creator: item.createur, confidence: 0.75, matchedItem: item.article }
          }
        }
      }
    }

    // 4. Recherche par mots-clés spécifiques (éviter les mots trop génériques)
    const descWords = descLower.split(" ").filter((word) => word.length > 3)
    const genericWords = ["bijou", "collier", "bracelet", "bague", "boucle", "pendentif", "creation", "fait", "main"]

    for (const word of descWords) {
      if (!genericWords.includes(word)) {
        for (const item of stockData) {
          const articleLower = item.article.toLowerCase().trim()
          const createurLower = item.createur.toLowerCase().trim()

          if (articleLower.includes(word) && articleLower.length > word.length + 2) {
            console.log(`🔍 Match mot-clé spécifique "${word}" dans "${item.article}" -> ${item.createur}`)
            return { creator: item.createur, confidence: 0.6, matchedItem: item.article }
          }

          if (createurLower.includes(word) && createurLower.length > word.length + 1) {
            console.log(`🔍 Match mot-clé créateur "${word}" dans "${item.createur}"`)
            return { creator: item.createur, confidence: 0.65, matchedItem: `Créateur: ${item.createur}` }
          }
        }
      }
    }

    console.log(`❌ Aucun match trouvé pour: "${description}"`)
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

    return lines
      .slice(1)
      .map((line) => {
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
        .filter((row) => row["Type"] === "Vente")
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
          const isAssigned = creator !== "Non identifié"
          const needsValidation = !isAssigned || confidence < 0.8

          return {
            index: pendingSales.length + index,
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
            isAssigned,
          }
        })

      // Ajouter aux ventes existantes
      const allPendingSales = [...pendingSales, ...pending]
      setPendingSales(allPendingSales)

      // Sauvegarder dans le store
      const pendingSalesToStore = pending.map((sale) => ({
        id: `pending_${Date.now()}_${sale.index}`,
        date: sale.date,
        description: sale.description,
        prix: sale.finalPrice,
        paiement: sale.paymentMethod,
        quantity: sale.quantity,
        commission: sale.commission.toString(),
        month: sale.month,
        suggestedCreator: sale.suggestedCreator,
        confidence: sale.confidence,
        matchedItem: sale.matchedItem,
        needsValidation: sale.needsValidation,
      }))

      addPendingSales(pendingSalesToStore)

      // Statistiques
      const assignedSales = pending.filter((sale) => sale.isAssigned)
      const unassignedSales = pending.filter((sale) => !sale.isAssigned)
      const highConfidenceSales = assignedSales.filter((sale) => sale.confidence >= 0.8)
      const lowConfidenceSales = assignedSales.filter((sale) => sale.confidence < 0.8)
      const monthsFound = [...new Set(pending.map((sale) => sale.month))].sort()

      setImportStatus({
        type: unassignedSales.length > 0 || lowConfidenceSales.length > 0 ? "warning" : "success",
        message: `${pending.length} nouvelles ventes analysées sur ${monthsFound.length} mois (${monthsFound.join(", ")}). 
        ✅ ${highConfidenceSales.length} assignées automatiquement, 
        ⚠️ ${lowConfidenceSales.length} à valider, 
        ❌ ${unassignedSales.length} non identifiées.`,
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
      prev.map((sale) => {
        if (sale.index === index) {
          const isAssigned = creator !== "Non identifié"
          const updatedSale = {
            ...sale,
            suggestedCreator: creator,
            needsValidation: !isAssigned,
            isAssigned,
          }

          // Mettre à jour dans le store
          const storeId = `pending_${Date.now()}_${index}`
          updatePendingSale(storeId, {
            suggestedCreator: creator,
            needsValidation: !isAssigned,
          })

          return updatedSale
        }
        return sale
      }),
    )
  }

  const removeUnassignedSale = (index: number) => {
    setPendingSales((prev) => prev.filter((sale) => sale.index !== index))

    // Supprimer du store
    const storeId = `pending_${Date.now()}_${index}`
    removePendingSale(storeId)
  }

  const handleCreateNewCreator = () => {
    if (newCreatorName.trim()) {
      addCreator(newCreatorName.trim())
      setNewCreatorName("")
      setShowNewCreatorDialog(false)
    }
  }

  const confirmImport = () => {
    // Importer uniquement les ventes assignées
    const validSales = pendingSales.filter((sale) => sale.isAssigned)

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

    // Garder uniquement les ventes non assignées
    const remainingSales = pendingSales.filter((sale) => !sale.isAssigned)
    setPendingSales(remainingSales)

    // Nettoyer le store et remettre seulement les non assignées
    clearPendingSales()
    if (remainingSales.length > 0) {
      const remainingToStore = remainingSales.map((sale) => ({
        id: `pending_${Date.now()}_${sale.index}`,
        date: sale.date,
        description: sale.description,
        prix: sale.finalPrice,
        paiement: sale.paymentMethod,
        quantity: sale.quantity,
        commission: sale.commission.toString(),
        month: sale.month,
        suggestedCreator: sale.suggestedCreator,
        confidence: sale.confidence,
        matchedItem: sale.matchedItem,
        needsValidation: sale.needsValidation,
      }))
      addPendingSales(remainingToStore)
    }

    setImportStatus({
      type: "success",
      message: `${validSales.length} ventes importées avec succès dans ${Object.keys(salesByMonth).length} mois ! ${remainingSales.length} ventes non assignées restent en attente.`,
    })
  }

  const clearAllPendingSales = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer toutes les ventes en attente ?")) {
      setPendingSales([])
      clearPendingSales()
      setImportStatus({
        type: "success",
        message: "Toutes les ventes en attente ont été supprimées.",
      })
    }
  }

  // Calculer le nombre de ventes à valider
  const salesToValidate = pendingSales.filter((sale) => sale.isAssigned && sale.needsValidation).length
  const unassignedSales = pendingSales.filter((sale) => !sale.isAssigned).length

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Upload className="h-5 w-5" />
            Import des ventes
            {(salesToValidate > 0 || unassignedSales > 0) && (
              <div className="flex gap-2">
                {salesToValidate > 0 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                    {salesToValidate} à valider
                  </Badge>
                )}
                {unassignedSales > 0 && <Badge variant="destructive">{unassignedSales} non assignées</Badge>}
              </div>
            )}
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium">
            Recherche améliorée : priorité aux correspondances créateur + article, puis créateur seul, puis article
            seul. Commission de {settings.commissionRate}% appliquée sur les paiements non-espèces.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sales-file" className="text-slate-900 font-semibold">
              Fichier de ventes (CSV)
            </Label>
            <div className="flex items-center gap-2">
              <Input id="sales-file" type="file" accept=".csv" onChange={handleFileChange} className="text-slate-900" />
              {salesFile && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!salesFile || importing || stockData.length === 0}
              className="flex-1"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {importing ? "Analyse en cours..." : "Analyser les ventes"}
            </Button>

            {pendingSales.length > 0 && (
              <Button
                onClick={clearAllPendingSales}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-transparent"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Vider la liste
              </Button>
            )}
          </div>

          {stockData.length === 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 font-medium">
                Veuillez d'abord importer le stock pour permettre l'attribution automatique.
              </AlertDescription>
            </Alert>
          )}

          {importStatus && (
            <Alert
              variant={importStatus.type === "error" ? "destructive" : "default"}
              className="bg-white border-slate-200"
            >
              {importStatus.type === "error" ? (
                <AlertCircle className="h-4 w-4" />
              ) : importStatus.type === "warning" ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              <AlertDescription className="whitespace-pre-line text-slate-900 font-medium">
                {importStatus.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {pendingSales.length > 0 && (
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-slate-900">
              <span>Ventes en attente de validation ({pendingSales.length})</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowNewCreatorDialog(true)}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Nouveau créateur
                </Button>
                <Button onClick={confirmImport} disabled={pendingSales.filter((sale) => sale.isAssigned).length === 0}>
                  Importer les ventes assignées ({pendingSales.filter((sale) => sale.isAssigned).length})
                </Button>
              </div>
            </CardTitle>
            <CardDescription className="text-slate-600 font-medium">
              Ces ventes sont sauvegardées et resteront disponibles même après changement d'onglet. Seules les ventes
              assignées à un créateur seront importées.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-900 font-semibold">Date</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Description</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Prix</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Paiement</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Commission</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Créateur</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Match</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Statut</TableHead>
                  <TableHead className="text-slate-900 font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSales.map((sale) => (
                  <TableRow
                    key={sale.index}
                    className={!sale.isAssigned ? "bg-red-50" : sale.needsValidation ? "bg-yellow-50" : "bg-green-50"}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-600" />
                        <span className="text-xs text-slate-900">
                          {new Date(sale.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs bg-white border-slate-200 text-slate-700">
                        {sale.month}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="font-medium truncate text-slate-900" title={sale.description}>
                        {sale.description}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{sale.finalPrice}€</TableCell>
                    <TableCell>
                      <Badge
                        variant={sale.paymentMethod.toLowerCase().includes("espèce") ? "secondary" : "default"}
                        className="bg-slate-100 text-slate-700 border-slate-200"
                      >
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sale.commission > 0 ? (
                        <span className="text-red-600 font-medium">-{sale.commission.toFixed(2)}€</span>
                      ) : (
                        <span className="text-green-600 font-medium">0€</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={sale.suggestedCreator}
                        onValueChange={(value) => updateCreatorAssignment(sale.index, value)}
                      >
                        <SelectTrigger className="w-40 text-slate-900">
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
                        <Badge
                          variant="outline"
                          className="text-xs bg-white border-slate-200 text-slate-700"
                          title={sale.matchedItem}
                        >
                          {sale.matchedItem.length > 20 ? sale.matchedItem.substring(0, 20) + "..." : sale.matchedItem}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!sale.isAssigned ? (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Non assigné
                        </Badge>
                      ) : sale.needsValidation ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />À valider ({Math.round(sale.confidence * 100)}%)
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validé ({Math.round(sale.confidence * 100)}%)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUnassignedSale(sale.index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showNewCreatorDialog} onOpenChange={setShowNewCreatorDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Créer un nouveau créateur</DialogTitle>
            <DialogDescription className="text-slate-600">
              Ajoutez un nouveau créateur à la liste pour pouvoir l'assigner aux ventes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-creator" className="text-slate-900 font-semibold">
                Nom du créateur
              </Label>
              <Input
                id="new-creator"
                value={newCreatorName}
                onChange={(e) => setNewCreatorName(e.target.value)}
                placeholder="Nom du nouveau créateur"
                className="text-slate-900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewCreatorDialog(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
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
