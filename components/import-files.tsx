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
    console.log("📝 Parsing CSV...")
    console.log("Longueur du texte:", text.length)

    const lines = text.split("\n")
    console.log("📊 Nombre de lignes:", lines.length)

    // Parser la première ligne pour les headers
    const headerLine = lines[0]
    const headers: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < headerLine.length; i++) {
      const char = headerLine[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        headers.push(current.trim().replace(/^"|"$/g, ""))
        current = ""
      } else {
        current += char
      }
    }
    headers.push(current.trim().replace(/^"|"$/g, ""))

    console.log("📋 Headers détectés:", headers)
    console.log("📊 Nombre de colonnes:", headers.length)

    // Parser les lignes de données
    const data: any[] = []

    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]
      if (!line.trim()) continue

      const values: string[] = []
      let current = ""
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""))
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""))

      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ""
      })

      // Log des 5 premières lignes pour debug
      if (lineIndex <= 5) {
        console.log(`📄 Ligne ${lineIndex}:`, {
          "Item name": obj["Item name"],
          Variations: obj["Variations"],
          Price: obj["Price"],
          Quantity: obj["Quantity"],
        })
      }

      data.push(obj)
    }

    console.log("✅ Parsing terminé:", data.length, "lignes de données")
    return data.filter((row) => Object.values(row).some((val) => val !== ""))
  }

  const handleStockFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("📁 Fichier sélectionné:", file.name)
      console.log("📏 Taille:", (file.size / 1024).toFixed(2), "KB")
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
      console.log("\n🚀 Début de l'import")
      console.log("=".repeat(80))

      const stockText = await stockFile.text()
      console.log("📝 Fichier lu, longueur:", stockText.length, "caractères")
      console.log("📄 Premiers 500 caractères:", stockText.substring(0, 500))

      const stockDataRaw = parseCSV(stockText)
      console.log("📊 Données parsées:", stockDataRaw.length, "lignes")

      // Traitement pour détecter créateurs et articles
      const processedData: any[] = []
      let currentCreator = ""
      const creatorsFound = new Set<string>()
      const warnings: string[] = []

      console.log("\n🔍 Analyse des données:")
      console.log("=".repeat(80))

      stockDataRaw.forEach((row, index) => {
        const itemName = (row["Item name"] || "").trim()
        const variations = (row["Variations"] || "").trim()
        const price = (row["Price"] || "0").trim()
        const quantity = (row["Quantity"] || "0").trim()
        const sku = (row["SKU"] || "").trim()
        const category = (row["Category"] || "").trim()
        const lowStockThreshold = (row["Low stock threshold"] || "0").trim()
        const image = (row["Image 1"] || "").trim()

        // Log détaillé des 10 premières lignes
        if (index < 10) {
          console.log(`\n📄 Ligne ${index + 1}:`)
          console.log(`  Item name: "${itemName}"`)
          console.log(`  Variations: "${variations}"`)
          console.log(`  Price: ${price}`)
          console.log(`  Quantity: ${quantity}`)
        }

        // Détection des créateurs: Item name présent mais pas de Variations
        if (itemName && !variations) {
          currentCreator = itemName
          creatorsFound.add(currentCreator)
          console.log(`\n👤 CRÉATEUR détecté: "${currentCreator}"`)
          return
        }

        // Détection des articles: Variations présent avec un créateur actif
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

          if (index < 10) {
            console.log(`  ✅ Article ajouté pour "${currentCreator}": "${variations}"`)
          }

          processedData.push(stockItem)
        } else if (variations && !currentCreator) {
          const warning = `⚠️ Ligne ${index + 1}: Article "${variations}" trouvé sans créateur`
          warnings.push(warning)
          if (warnings.length <= 5) {
            console.warn(warning)
          }
        }
      })

      console.log("\n📈 RÉSUMÉ DE L'IMPORT:")
      console.log("=".repeat(80))
      console.log(`👥 Créateurs trouvés: ${creatorsFound.size}`)
      console.log(`📦 Articles traités: ${processedData.length}`)
      console.log(`⚠️  Avertissements: ${warnings.length}`)

      if (creatorsFound.size > 0) {
        console.log("\n👥 Liste des créateurs:")
        Array.from(creatorsFound).forEach((creator, i) => {
          const articlesCount = processedData.filter((item) => item.createur === creator).length
          console.log(`  ${i + 1}. "${creator}" - ${articlesCount} article(s)`)
        })
      }

      if (processedData.length > 0) {
        console.log("\n📦 Échantillon d'articles:")
        processedData.slice(0, 5).forEach((item, i) => {
          console.log(`  ${i + 1}. "${item.article}" (${item.createur}) - ${item.price}€`)
        })
      }

      if (processedData.length === 0) {
        const errorMsg =
          creatorsFound.size > 0
            ? `❌ ${creatorsFound.size} créateur(s) trouvé(s) mais aucun article. Vérifiez que les articles ont bien une valeur dans la colonne "Variations".`
            : "❌ Aucun créateur ni article trouvé. Vérifiez le format du fichier CSV."

        console.error(errorMsg)
        setImportStatus({
          type: "error",
          message: errorMsg,
        })
        setImporting(false)
        return
      }

      console.log("\n💾 Import des données dans le store...")
      importStockData(processedData)
      console.log("✅ Import terminé avec succès!")

      const warningText = warnings.length > 0 ? ` (${warnings.length} article(s) sans créateur ignoré(s))` : ""

      setImportStatus({
        type: "success",
        message: `✅ ${processedData.length} article(s) importé(s) avec succès pour ${creatorsFound.size} créateur(s)${warningText}`,
      })

      // Reset
      setStockFile(null)
      const fileInput = document.getElementById("stock-file") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    } catch (error) {
      console.error("❌ ERREUR lors de l'import:", error)
      console.error("Stack trace:", error instanceof Error ? error.stack : "N/A")
      setImportStatus({
        type: "error",
        message: `❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      })
    } finally {
      setImporting(false)
      console.log("\n" + "=".repeat(80))
      console.log("🏁 Fin de l'import")
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
                Import du stock SumUp
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium">
                Importez le fichier CSV d'export depuis SumUp (Items Export)
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
                    📁 <strong>{stockFile.name}</strong> ({(stockFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <Button onClick={handleStockImport} disabled={!stockFile || importing} className="w-full h-12 text-base">
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                {importing ? "⏳ Import en cours..." : "🚀 Importer le stock"}
              </Button>

              {importStatus && (
                <Alert
                  variant={importStatus.type === "error" ? "destructive" : "default"}
                  className={importStatus.type === "error" ? "" : "bg-green-50 border-green-200"}
                >
                  {importStatus.type === "error" ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <AlertDescription
                    className={importStatus.type === "error" ? "text-base" : "text-green-800 font-medium text-base"}
                  >
                    {importStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Format du fichier SumUp
                </h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span>Exportez vos articles depuis SumUp (Items Export)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span>
                      Les lignes avec <strong>"Item name"</strong> mais sans <strong>"Variations"</strong> sont les
                      créateurs
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span>
                      Les lignes avec <strong>"Variations"</strong> sont les articles du créateur précédent
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <h4 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Conseil
                </h4>
                <p className="text-sm text-amber-800">
                  Ouvrez la console (F12) pour voir les détails de l'import et diagnostiquer les problèmes éventuels.
                </p>
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
