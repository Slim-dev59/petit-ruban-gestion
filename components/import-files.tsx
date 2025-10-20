"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, Package, History, Trash2 } from "lucide-react"
import { useStore } from "@/lib/store"
import { SalesImport } from "./sales-import"

export function ImportFiles() {
  const [stockFile, setStockFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const { importStockData, stockData, creators, getImportHistory, removeImportHistory } = useStore()

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("📋 Headers du fichier de stock:", headers)
    console.log("📊 Nombre de colonnes:", headers.length)

    return lines
      .slice(1)
      .map((line, lineIndex) => {
        // Parsing CSV amélioré pour gérer les virgules dans les valeurs entre guillemets
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
        values.push(current.trim()) // Ajouter la dernière valeur

        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = values[index] || ""
        })

        // Log détaillé pour les 5 premières lignes
        if (lineIndex < 5) {
          console.log(`📄 Ligne ${lineIndex + 1}:`, obj)
        }

        return obj
      })
      .filter((row) => Object.values(row).some((val) => val !== ""))
  }

  const handleStockFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("📁 Fichier sélectionné:", file.name)
      setStockFile(file)
      setImportStatus(null)
    }
  }

  const handleStockImport = async () => {
    if (!stockFile) {
      setImportStatus({ type: "error", message: "⚠️ Veuillez sélectionner le fichier de stock" })
      return
    }

    setImporting(true)
    setImportStatus(null)

    try {
      console.log("🔄 Début de l'import du fichier:", stockFile.name)
      const stockText = await stockFile.text()
      console.log("📝 Contenu du fichier (premiers 500 caractères):", stockText.substring(0, 500))

      const stockDataRaw = parseCSV(stockText)
      console.log("📊 Données brutes parsées:", stockDataRaw.length, "lignes")

      // Traitement spécifique pour le format SumUp
      const processedData: any[] = []
      let currentCreator = ""
      const creatorsFound = new Set<string>()

      stockDataRaw.forEach((row, index) => {
        const itemName = (row["Item name"] || "").trim()
        const variations = (row["Variations"] || "").trim()
        const price = (row["Price"] || "0").trim()
        const quantity = (row["Quantity"] || "0").trim()
        const sku = (row["SKU"] || "").trim()
        const category = (row["Category"] || "").trim()
        const lowStockThreshold = (row["Low stock threshold"] || "0").trim()
        const image = (row["Image 1"] || "").trim()

        // Log détaillé pour les 10 premières lignes
        if (index < 10) {
          console.log(`\n🔍 Ligne ${index + 1}:`)
          console.log("  - Item name:", itemName)
          console.log("  - Variations:", variations)
          console.log("  - Prix:", price)
          console.log("  - Quantité:", quantity)
        }

        // Si on a un Item name mais pas de Variations, c'est un créateur
        if (itemName && !variations) {
          currentCreator = itemName
          creatorsFound.add(currentCreator)
          console.log(`👤 Nouveau créateur détecté: "${currentCreator}"`)
          return
        }

        // Si on a des Variations et un créateur actuel, c'est un article
        if (variations && currentCreator) {
          const stockItem = {
            createur: currentCreator,
            article: variations,
            price: price,
            quantity: quantity,
            category: category,
            sku: sku,
            lowStockThreshold: lowStockThreshold,
            image: image,
          }

          console.log(`✅ Article ajouté pour ${currentCreator}:`, stockItem.article)
          processedData.push(stockItem)
        } else if (variations && !currentCreator) {
          console.warn(`⚠️ Article trouvé sans créateur: ${variations}`)
        }
      })

      console.log("\n📈 Résumé de l'import:")
      console.log("  - Créateurs trouvés:", Array.from(creatorsFound))
      console.log("  - Articles traités:", processedData.length)
      console.log("  - Échantillon:", processedData.slice(0, 3))

      if (processedData.length === 0) {
        setImportStatus({
          type: "error",
          message: "❌ Aucun article trouvé. Vérifiez le format du fichier CSV.",
        })
        setImporting(false)
        return
      }

      importStockData(processedData)

      setImportStatus({
        type: "success",
        message: `✅ ${processedData.length} articles importés avec succès pour ${creatorsFound.size} créateur(s) !`,
      })

      // Reset
      setStockFile(null)

      // Reset input file
      const fileInput = document.getElementById("stock-file") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'import:", error)
      setImportStatus({
        type: "error",
        message: `❌ Erreur lors de l'analyse du fichier: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      })
    } finally {
      setImporting(false)
    }
  }

  const importHistory = getImportHistory()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Import des fichiers</h2>
          <p className="text-slate-600 font-medium">Importez vos données de stock et de ventes</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="flex items-center gap-2 bg-white border-slate-200 text-slate-700">
            <Users className="h-4 w-4" />
            {creators.length} créateurs
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2 bg-white border-slate-200 text-slate-700">
            <Package className="h-4 w-4" />
            {stockData.length} articles
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="h-auto w-full bg-slate-100 rounded-2xl p-2 grid grid-cols-3 gap-2">
          <TabsTrigger
            value="stock"
            className="h-12 rounded-xl border-0 bg-transparent text-slate-700 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Import Stock</span>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="sales"
            className="h-12 rounded-xl border-0 bg-transparent text-slate-700 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import Ventes</span>
            </div>
          </TabsTrigger>

          <TabsTrigger
            value="history"
            className="h-12 rounded-xl border-0 bg-transparent text-slate-700 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Historique</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Upload className="h-5 w-5" />
                Import du stock
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Importez le fichier CSV d'export SumUp. Les créateurs seront détectés automatiquement à partir des "Item
                name" et les articles à partir des "Variations".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="stock-file" className="text-slate-900 font-semibold">
                  Fichier de stock (CSV)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="stock-file"
                    type="file"
                    accept=".csv"
                    onChange={handleStockFileChange}
                    className="text-slate-900"
                  />
                  {stockFile && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                {stockFile && (
                  <p className="text-sm text-slate-600">
                    📁 Fichier sélectionné: <strong>{stockFile.name}</strong> ({(stockFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button onClick={handleStockImport} disabled={!stockFile || importing} className="w-full">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {importing ? "Import en cours..." : "Importer le stock"}
              </Button>

              {importStatus && (
                <Alert
                  variant={importStatus.type === "error" ? "destructive" : "default"}
                  className={importStatus.type === "error" ? "" : "bg-green-50 border-green-200"}
                >
                  {importStatus.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  <AlertDescription className={importStatus.type === "error" ? "" : "text-green-800 font-medium"}>
                    {importStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Format attendu:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    • Les <strong>Item name</strong> sans <strong>Variations</strong> sont des créateurs
                  </li>
                  <li>
                    • Les lignes avec <strong>Variations</strong> sont les articles du créateur précédent
                  </li>
                  <li>• Le fichier doit être au format CSV avec des colonnes séparées par des virgules</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <SalesImport />
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-white border-slate-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <History className="h-5 w-5" />
                Historique des imports
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Consultez l'historique de vos imports de ventes et leurs statistiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-900 font-semibold">Aucun import effectué</p>
                  <p className="text-sm text-slate-600">L'historique de vos imports apparaîtra ici</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-900 font-semibold">Date</TableHead>
                      <TableHead className="text-slate-900 font-semibold">Fichier</TableHead>
                      <TableHead className="text-slate-900 font-semibold">Ventes totales</TableHead>
                      <TableHead className="text-slate-900 font-semibold">Assignées</TableHead>
                      <TableHead className="text-slate-900 font-semibold">Non assignées</TableHead>
                      <TableHead className="text-slate-900 font-semibold">Mois</TableHead>
                      <TableHead className="text-slate-900 font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map((importItem) => (
                      <TableRow key={importItem.id}>
                        <TableCell className="text-slate-900">
                          {new Date(importItem.importDate).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{importItem.fileName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white border-slate-200 text-slate-700">
                            {importItem.salesCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            {importItem.assignedCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">{importItem.unassignedCount}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {importItem.months.map((month) => (
                              <Badge
                                key={month}
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-700 border-slate-200"
                              >
                                {month}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImportHistory(importItem.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
