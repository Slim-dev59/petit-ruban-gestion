"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImportFiles } from "@/components/import-files"
import { StockOverview } from "@/components/stock-overview"
import { SalesImport } from "@/components/sales-import"
import { Upload, Package, TrendingUp, AlertCircle } from "lucide-react"
import { useStore } from "@/lib/store"
import Papa from "papaparse"
import * as XLSX from "xlsx"

export function ImportManager() {
  const {
    selectedMonth,
    setSalesData,
    setStockData,
    addCreator,
    creators,
    settings,
    salesData,
    stockData,
    getCurrentData,
  } = useStore()

  const [stockFile, setStockFile] = useState<File | null>(null)
  const [salesFile, setSalesFile] = useState<File | null>(null)
  const [stockPreview, setStockPreview] = useState<any[]>([])
  const [salesPreview, setSalesPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showStockPreview, setShowStockPreview] = useState(false)
  const [showSalesPreview, setShowSalesPreview] = useState(false)

  const stockInputRef = useRef<HTMLInputElement>(null)
  const salesInputRef = useRef<HTMLInputElement>(null)

  const currentData = getCurrentData()
  const [activeImportTab, setActiveImportTab] = useState("stock")

  const hasStock = currentData.stock.length > 0
  const hasSales = currentData.sales.length > 0

  // Données existantes pour le mois sélectionné
  const currentMonthSales = salesData.filter((s) => s.month === selectedMonth)
  const currentMonthStock = stockData.filter((s) => s.month === selectedMonth)

  const parseFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split(".").pop()?.toLowerCase()

      if (extension === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error("Erreur lors de la lecture du CSV"))
            } else {
              resolve(results.data as any[])
            }
          },
          error: (error) => reject(error),
        })
      } else if (extension === "xlsx" || extension === "xls") {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            resolve(jsonData)
          } catch (error) {
            reject(error)
          }
        }
        reader.readAsArrayBuffer(file)
      } else {
        reject(new Error("Format de fichier non supporté"))
      }
    })
  }

  const identifyCreatorFromDescription = (description: string): string => {
    const desc = description.toLowerCase()
    const words = desc.split(" ").slice(0, 4) // Analyser les 4 premiers mots

    for (const creator of creators) {
      if (creator === "Non identifié") continue

      const creatorName = creator.toLowerCase()
      const creatorWords = creatorName.split(" ")

      // Vérification exacte du nom complet
      if (words.join(" ").includes(creatorName)) {
        return creator
      }

      // Vérification par mots individuels
      const matchedWords = creatorWords.filter((word) =>
        words.some((descWord) => descWord.includes(word) || word.includes(descWord)),
      )

      if (matchedWords.length === creatorWords.length) {
        return creator
      }

      // Vérification par initiales si le créateur a plusieurs mots
      if (creatorWords.length > 1) {
        const initials = creatorWords.map((word) => word[0]).join("")
        if (words.some((word) => word.includes(initials))) {
          return creator
        }
      }
    }

    return "Non identifié"
  }

  const handleStockFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setStockFile(file)
    setLoading(true)
    setMessage("")

    try {
      const data = await parseFile(file)
      if (data.length === 0) {
        throw new Error("Le fichier est vide")
      }

      setStockPreview(data.slice(0, 5))
      setMessage(`✅ Fichier stock analysé: ${data.length} lignes détectées`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSalesFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSalesFile(file)
    setLoading(true)
    setMessage("")

    try {
      const data = await parseFile(file)
      if (data.length === 0) {
        throw new Error("Le fichier est vide")
      }

      setSalesPreview(data.slice(0, 5))
      setMessage(`✅ Fichier ventes analysé: ${data.length} lignes détectées`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStockImport = async () => {
    if (!stockFile) return

    setLoading(true)
    try {
      const data = await parseFile(stockFile)
      const processedStock = data
        .map((row, index) => {
          const creatorName = row[settings.stockTemplate.creatorColumn] || ""
          const articleName = row[settings.stockTemplate.articleColumn] || ""

          if (creatorName && !creators.includes(creatorName)) {
            addCreator(creatorName)
          }

          return {
            id: `stock_${selectedMonth}_${index}_${Date.now()}`,
            article: articleName,
            price: row[settings.stockTemplate.priceColumn] || "0",
            quantity: row[settings.stockTemplate.quantityColumn] || "0",
            sku: row[settings.stockTemplate.skuColumn] || "",
            createur: creatorName || "Non identifié",
            lowStockThreshold: "5",
            month: selectedMonth,
          }
        })
        .filter((item) => item.article && item.createur)

      setStockData(processedStock)
      setMessage(`✅ ${processedStock.length} articles importés pour ${selectedMonth}`)

      // Reset
      setStockFile(null)
      setStockPreview([])
      if (stockInputRef.current) stockInputRef.current.value = ""
    } catch (error) {
      setMessage(`❌ Erreur lors de l'import: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSalesImport = async () => {
    if (!salesFile) return

    setLoading(true)
    try {
      const data = await parseFile(salesFile)
      const processedSales = data
        .map((row, index) => {
          const description = row[settings.salesTemplate.descriptionColumn] || ""
          const identifiedCreator = identifyCreatorFromDescription(description)

          // Ajouter "Non identifié" si nécessaire
          if (identifiedCreator === "Non identifié" && !creators.includes("Non identifié")) {
            addCreator("Non identifié")
          }

          return {
            id: `sale_${selectedMonth}_${index}_${Date.now()}`,
            date: row[settings.salesTemplate.dateColumn] || new Date().toISOString().split("T")[0],
            description: description,
            prix: row[settings.salesTemplate.priceColumn] || "0",
            paiement: row[settings.salesTemplate.paymentColumn] || "Carte",
            createur: identifiedCreator,
            identified: identifiedCreator !== "Non identifié",
            month: selectedMonth,
          }
        })
        .filter((sale) => sale.description)

      setSalesData(processedSales)
      setMessage(`✅ ${processedSales.length} ventes importées pour ${selectedMonth}`)

      // Reset
      setSalesFile(null)
      setSalesPreview([])
      if (salesInputRef.current) salesInputRef.current.value = ""
    } catch (error) {
      setMessage(`❌ Erreur lors de l'import: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Import de Données</h2>
          <p className="text-gray-600">Importez vos fichiers de stock et de ventes</p>
        </div>
      </div>

      {/* Alertes */}
      {!hasStock && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">Stock non importé</p>
                <p className="text-sm text-orange-700">
                  Importez d'abord votre fichier de stock pour pouvoir traiter les ventes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onglets d'import */}
      <Tabs value={activeImportTab} onValueChange={setActiveImportTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2" disabled={!hasStock}>
            <TrendingUp className="w-4 h-4" />
            Ventes
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import du Stock</CardTitle>
              <CardDescription>Importez votre fichier CSV/Excel contenant les informations de stock</CardDescription>
            </CardHeader>
            <CardContent>
              <ImportFiles type="stock" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import des Ventes</CardTitle>
              <CardDescription>Importez votre fichier CSV/Excel contenant les données de ventes</CardDescription>
            </CardHeader>
            <CardContent>
              <SalesImport />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <StockOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
