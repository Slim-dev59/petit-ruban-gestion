"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, CheckCircle, Download, Eye, Settings } from "lucide-react"
import { useStore } from "@/lib/store"
import Papa from "papaparse"
import * as XLSX from "xlsx"

export function ImportManager() {
  const { selectedMonth, setSalesData, setStockData, addCreator, creators, settings, salesData, stockData } = useStore()

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

  const downloadTemplate = (type: "stock" | "sales") => {
    let headers: string[]
    let sampleData: any[]

    if (type === "stock") {
      headers = [
        settings.stockTemplate.creatorColumn,
        settings.stockTemplate.articleColumn,
        settings.stockTemplate.priceColumn,
        settings.stockTemplate.quantityColumn,
        settings.stockTemplate.skuColumn,
      ]
      sampleData = [
        {
          [settings.stockTemplate.creatorColumn]: "Marie Dupont",
          [settings.stockTemplate.articleColumn]: "Bracelet perles bleues",
          [settings.stockTemplate.priceColumn]: "25.00",
          [settings.stockTemplate.quantityColumn]: "5",
          [settings.stockTemplate.skuColumn]: "MD-BR-001",
        },
      ]
    } else {
      headers = [
        settings.salesTemplate.descriptionColumn,
        settings.salesTemplate.priceColumn,
        settings.salesTemplate.paymentColumn,
        settings.salesTemplate.dateColumn,
      ]
      sampleData = [
        {
          [settings.salesTemplate.descriptionColumn]: "Marie Dupont bracelet perles bleues",
          [settings.salesTemplate.priceColumn]: "25.00",
          [settings.salesTemplate.paymentColumn]: "Carte",
          [settings.salesTemplate.dateColumn]: "2024-01-15",
        },
      ]
    }

    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `template_${type}_${selectedMonth}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec mois sélectionné */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import de données - {formatMonth(selectedMonth)}
          </CardTitle>
          <CardDescription>
            Importez vos fichiers de stock et ventes pour le mois sélectionné. Chaque mois est géré indépendamment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Données existantes */}
          {(currentMonthSales.length > 0 || currentMonthStock.length > 0) && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Données existantes pour {formatMonth(selectedMonth)} :</strong>
                {currentMonthStock.length > 0 && ` ${currentMonthStock.length} articles en stock`}
                {currentMonthSales.length > 0 && ` ${currentMonthSales.length} ventes`}
                {currentMonthSales.length > 0 && currentMonthStock.length > 0 && " • "}
                <br />
                L'import remplacera les données existantes pour ce mois.
              </AlertDescription>
            </Alert>
          )}

          {/* Configuration des templates */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Configuration des colonnes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-800 mb-1">Stock :</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Créateur : {settings.stockTemplate.creatorColumn}</li>
                  <li>• Article : {settings.stockTemplate.articleColumn}</li>
                  <li>• Prix : {settings.stockTemplate.priceColumn}</li>
                  <li>• Quantité : {settings.stockTemplate.quantityColumn}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-blue-800 mb-1">Ventes :</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Description : {settings.salesTemplate.descriptionColumn}</li>
                  <li>• Prix : {settings.salesTemplate.priceColumn}</li>
                  <li>• Paiement : {settings.salesTemplate.paymentColumn}</li>
                  <li>• Date : {settings.salesTemplate.dateColumn}</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Modifiez ces paramètres dans l'onglet "Paramètres" si nécessaire
            </p>
          </div>

          {/* Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button onClick={() => downloadTemplate("stock")} variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Template Stock ({formatMonth(selectedMonth)})
            </Button>
            <Button onClick={() => downloadTemplate("sales")} variant="outline" className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Template Ventes ({formatMonth(selectedMonth)})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import des fichiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Import Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <input
                ref={stockInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleStockFileChange}
                className="hidden"
                id="stock-file"
              />
              <label htmlFor="stock-file" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{stockFile ? stockFile.name : "Cliquez pour sélectionner"}</p>
              </label>
            </div>

            {stockPreview.length > 0 && (
              <div className="space-y-2">
                <Button
                  onClick={() => setShowStockPreview(!showStockPreview)}
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showStockPreview ? "Masquer" : "Voir"} aperçu
                </Button>

                {showStockPreview && (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                    <div className="text-xs space-y-1">
                      {stockPreview.map((row, index) => (
                        <div key={index} className="border-b border-gray-200 pb-1">
                          <strong>{row[settings.stockTemplate.creatorColumn] || "N/A"}</strong> -
                          {row[settings.stockTemplate.articleColumn] || "N/A"}(
                          {row[settings.stockTemplate.priceColumn] || "0"}€)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleStockImport} disabled={loading} className="w-full">
                  Importer Stock ({selectedMonth})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Ventes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Import Ventes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={salesInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleSalesFileChange}
                className="hidden"
                id="sales-file"
              />
              <label htmlFor="sales-file" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{salesFile ? salesFile.name : "Cliquez pour sélectionner"}</p>
              </label>
            </div>

            {salesPreview.length > 0 && (
              <div className="space-y-2">
                <Button
                  onClick={() => setShowSalesPreview(!showSalesPreview)}
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showSalesPreview ? "Masquer" : "Voir"} aperçu
                </Button>

                {showSalesPreview && (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                    <div className="text-xs space-y-1">
                      {salesPreview.map((row, index) => (
                        <div key={index} className="border-b border-gray-200 pb-1">
                          <strong>{row[settings.salesTemplate.descriptionColumn] || "N/A"}</strong>(
                          {row[settings.salesTemplate.priceColumn] || "0"}€)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleSalesImport} disabled={loading} className="w-full">
                  Importer Ventes ({selectedMonth})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      {loading && (
        <Alert>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Traitement en cours...
          </div>
        </Alert>
      )}

      {message && (
        <Alert className={message.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {message.includes("✅") ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.includes("✅") ? "text-green-800" : "text-red-800"}>
            {message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
