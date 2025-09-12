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
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Users, Package } from "lucide-react"
import { useStore } from "@/lib/store"
import { SalesImport } from "./sales-import"

export function ImportFiles() {
  const [stockFile, setStockFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const { importStockData, stockData, creators } = useStore()

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("Headers du fichier de stock:", headers)
    console.log("Nombre de colonnes:", headers.length)

    return lines
      .slice(1)
      .map((line) => {
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
        return obj
      })
      .filter((row) => Object.values(row).some((val) => val !== ""))
  }

  const handleStockFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setStockFile(file)
    }
  }

  const handleStockImport = async () => {
    if (!stockFile) {
      setImportStatus({ type: "error", message: "Veuillez sélectionner le fichier de stock" })
      return
    }

    setImporting(true)
    setImportStatus(null)

    try {
      const stockText = await stockFile.text()
      const stockData = parseCSV(stockText)

      console.log("Données stock brutes:", stockData.slice(0, 3))

      // Traitement spécifique pour le format SumUp
      const processedData: any[] = []
      let currentCreator = ""

      stockData.forEach((row, index) => {
        const itemName = row["Item name"] || ""
        const variations = row["Variations"] || ""
        const price = row["Price"] || "0"
        const quantity = row["Quantity"] || "0"
        const sku = row["SKU"] || ""
        const category = row["Category"] || ""
        const lowStockThreshold = row["Low stock threshold"] || "0"
        const image = row["Image 1"] || ""

        console.log(`Ligne ${index}: ItemName="${itemName}", Variations="${variations}"`)

        // Si on a un Item name mais pas de Variations, c'est un créateur
        if (itemName.trim() && !variations.trim()) {
          currentCreator = itemName.trim()
          console.log(`Nouveau créateur détecté: ${currentCreator}`)
          return
        }

        // Si on a des Variations et un créateur actuel, c'est un article
        if (variations.trim() && currentCreator) {
          const stockItem = {
            createur: currentCreator,
            article: variations.trim(),
            price: price,
            quantity: quantity,
            category: category,
            sku: sku,
            lowStockThreshold: lowStockThreshold,
            image: image,
          }

          console.log(`Article ajouté:`, stockItem)
          processedData.push(stockItem)
        }
      })

      console.log("Articles traités:", processedData.length)
      console.log("Échantillon:", processedData.slice(0, 3))

      importStockData(processedData)

      setImportStatus({
        type: "success",
        message: `✅ ${processedData.length} articles importés avec succès !`,
      })

      // Reset
      setStockFile(null)
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      setImportStatus({
        type: "error",
        message: "Erreur lors de l'analyse du fichier de stock",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Import des fichiers</h2>
          <p className="text-muted-foreground">Importez vos données de stock et de ventes</p>
        </div>
        <div className="flex gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {creators.length} créateurs
          </Badge>
          <Badge variant="outline" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {stockData.length} articles
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock">Import Stock</TabsTrigger>
          <TabsTrigger value="sales">Import Ventes</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import du stock
              </CardTitle>
              <CardDescription>
                Importez le fichier CSV d'export SumUp. Les créateurs seront détectés automatiquement à partir des "Item
                name" et les articles à partir des "Variations".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="stock-file">Fichier de stock (CSV)</Label>
                <div className="flex items-center gap-2">
                  <Input id="stock-file" type="file" accept=".csv" onChange={handleStockFileChange} />
                  {stockFile && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>

              <Button onClick={handleStockImport} disabled={!stockFile || importing} className="w-full">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {importing ? "Import en cours..." : "Importer le stock"}
              </Button>

              {importStatus && (
                <Alert variant={importStatus.type === "error" ? "destructive" : "default"}>
                  {importStatus.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{importStatus.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <SalesImport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
