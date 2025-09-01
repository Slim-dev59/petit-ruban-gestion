"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle, CheckCircle, Eye } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ImportFilesProps {
  type: "stock" | "sales"
}

export function ImportFiles({ type }: ImportFilesProps) {
  const { getCurrentData, setStock, setSales, addCreator, creators, setStockData, setSalesData, settings } = useStore()

  const currentData = getCurrentData()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    const words = desc.split(" ").slice(0, 4)

    for (const creator of creators) {
      if (creator === "Non identifié") continue

      const creatorName = creator.toLowerCase()
      const creatorWords = creatorName.split(" ")

      if (words.join(" ").includes(creatorName)) {
        return creator
      }

      const matchedWords = creatorWords.filter((word) =>
        words.some((descWord) => descWord.includes(word) || word.includes(descWord)),
      )

      if (matchedWords.length === creatorWords.length) {
        return creator
      }

      if (creatorWords.length > 1) {
        const initials = creatorWords.map((word) => word[0]).join("")
        if (words.some((word) => word.includes(initials))) {
          return creator
        }
      }
    }

    return "Non identifié"
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFile(file)
    setLoading(true)
    setMessage("")

    try {
      const data = await parseFile(file)
      if (data.length === 0) {
        throw new Error("Le fichier est vide")
      }

      setPreview(data.slice(0, 5))
      setMessage(`✅ Fichier analysé: ${data.length} lignes détectées`)
    } catch (error) {
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    try {
      const data = await parseFile(file)

      if (type === "stock") {
        const processedStock = data
          .map((row, index) => {
            const creatorName = row[settings.stockTemplate.creatorColumn] || ""
            const articleName = row[settings.stockTemplate.articleColumn] || ""

            if (creatorName && !creators.includes(creatorName)) {
              addCreator(creatorName)
            }

            return {
              id: `stock_${index}_${Date.now()}`,
              article: articleName,
              price: row[settings.stockTemplate.priceColumn] || "0",
              quantity: row[settings.stockTemplate.quantityColumn] || "0",
              sku: row[settings.stockTemplate.skuColumn] || "",
              createur: creatorName || "Non identifié",
              lowStockThreshold: "5",
            }
          })
          .filter((item) => item.article && item.createur)

        setStockData(processedStock)
        setMessage(`✅ ${processedStock.length} articles importés`)
      } else {
        const processedSales = data
          .map((row, index) => {
            const description = row[settings.salesTemplate.descriptionColumn] || ""
            const identifiedCreator = identifyCreatorFromDescription(description)

            if (identifiedCreator === "Non identifié" && !creators.includes("Non identifié")) {
              addCreator("Non identifié")
            }

            return {
              id: `sale_${index}_${Date.now()}`,
              date: row[settings.salesTemplate.dateColumn] || new Date().toISOString().split("T")[0],
              description: description,
              prix: row[settings.salesTemplate.priceColumn] || "0",
              paiement: row[settings.salesTemplate.paymentColumn] || "Carte",
              createur: identifiedCreator,
              identified: identifiedCreator !== "Non identifié",
            }
          })
          .filter((sale) => sale.description)

        setSalesData(processedSales)
        setMessage(`✅ ${processedSales.length} ventes importées`)
      }

      // Reset
      setFile(null)
      setPreview([])
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (error) {
      setMessage(`❌ Erreur lors de l'import: ${error instanceof Error ? error.message : "Erreur inconnue"}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = type === "stock" ? settings.stockTemplate : settings.salesTemplate
    const headers = Object.values(template)
    const sampleData = [
      headers.reduce(
        (acc, header) => {
          acc[header] = `Exemple ${header}`
          return acc
        },
        {} as Record<string, string>,
      ),
    ]

    const csvContent = [
      headers.join(","),
      ...sampleData.map((row) => headers.map((header) => `"${row[header]}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${type}-template.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import {type === "stock" ? "du Stock" : "des Ventes"}</CardTitle>
          <CardDescription>
            Importez un fichier CSV ou Excel contenant les informations de {type === "stock" ? "stock" : "ventes"}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fichier CSV/Excel</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id={`${type}-file`}
              />
              <label htmlFor={`${type}-file`} className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{file ? file.name : "Cliquez pour sélectionner"}</p>
              </label>
            </div>
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                size="sm"
                className="bg-transparent"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Masquer" : "Voir"} aperçu
              </Button>

              {showPreview && (
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                  <div className="text-xs space-y-1">
                    {preview.map((row, index) => (
                      <div key={index} className="border-b border-gray-200 pb-1">
                        {type === "stock" ? (
                          <strong>{row[settings.stockTemplate.articleColumn] || "N/A"}</strong>
                        ) : (
                          <strong>{row[settings.salesTemplate.descriptionColumn] || "N/A"}</strong>
                        )}
                        {" - "}
                        {type === "stock"
                          ? `${row[settings.stockTemplate.priceColumn] || "0"}€`
                          : `${row[settings.salesTemplate.priceColumn] || "0"}€`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between">
            <Button onClick={downloadTemplate} variant="link" className="bg-transparent">
              Télécharger le template
            </Button>
            <Button onClick={handleImport} disabled={!file || loading}>
              {loading ? "Import en cours..." : "Importer"}
            </Button>
          </div>

          {message && (
            <Alert className={message.includes("✅") ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {message.includes("✅") ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={message.includes("✅") ? "text-green-800" : "text-red-800"}>
                {message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
