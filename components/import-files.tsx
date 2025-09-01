"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, FileText, AlertCircle, CheckCircle, Download, Eye } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface ImportFilesProps {
  onStockImport: (data: any[]) => void
  onSalesImport: (data: any[]) => void
}

export default function ImportFiles({ onStockImport, onSalesImport }: ImportFilesProps) {
  const [stockFile, setStockFile] = useState<File | null>(null)
  const [salesFile, setSalesFile] = useState<File | null>(null)
  const [stockData, setStockData] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [stockPreview, setStockPreview] = useState<any[]>([])
  const [salesPreview, setSalesPreview] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showStockPreview, setShowStockPreview] = useState(false)
  const [showSalesPreview, setShowSalesPreview] = useState(false)

  const stockInputRef = useRef<HTMLInputElement>(null)
  const salesInputRef = useRef<HTMLInputElement>(null)

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

      setStockData(data)
      setStockPreview(data.slice(0, 5))
      setMessage(`✅ Fichier stock analysé: ${data.length} lignes détectées`)
    } catch (error) {
      setMessage(
        `❌ Erreur lors de l'analyse du fichier: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      )
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

      setSalesData(data)
      setSalesPreview(data.slice(0, 5))
      setMessage(`✅ Fichier ventes analysé: ${data.length} lignes détectées`)
    } catch (error) {
      setMessage(
        `❌ Erreur lors de l'analyse du fichier: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleStockImport = () => {
    if (stockData.length > 0) {
      onStockImport(stockData)
      setMessage(`✅ ${stockData.length} articles importés avec succès!`)
      setStockFile(null)
      setStockData([])
      setStockPreview([])
      if (stockInputRef.current) stockInputRef.current.value = ""
    }
  }

  const handleSalesImport = () => {
    if (salesData.length > 0) {
      onSalesImport(salesData)
      setMessage(`✅ ${salesData.length} ventes importées avec succès!`)
      setSalesFile(null)
      setSalesData([])
      setSalesPreview([])
      if (salesInputRef.current) salesInputRef.current.value = ""
    }
  }

  const downloadTemplate = (type: "stock" | "sales") => {
    let headers: string[]
    let sampleData: any[]

    if (type === "stock") {
      headers = ["Item name", "Variations", "Price", "Quantity", "Category"]
      sampleData = [
        {
          "Item name": "Créateur A",
          Variations: "Bracelet perles bleues",
          Price: "25.00",
          Quantity: "5",
          Category: "Bijoux",
        },
        {
          "Item name": "Créateur B",
          Variations: "Collier argent",
          Price: "45.00",
          Quantity: "3",
          Category: "Bijoux",
        },
      ]
    } else {
      headers = ["Description", "Price", "Quantity", "Date"]
      sampleData = [
        {
          Description: "Créateur A - Bracelet perles bleues",
          Price: "25.00",
          Quantity: "1",
          Date: "2024-01-15",
        },
        {
          Description: "Créateur B - Collier argent vintage",
          Price: "45.00",
          Quantity: "1",
          Date: "2024-01-16",
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
    link.setAttribute("download", `template_${type}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Upload className="w-7 h-7 text-blue-600" />
          Import de fichiers
        </h2>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Instructions d'import</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Stock:</strong> Item name = Créateur, Variations = Article
            </p>
            <p>
              <strong>Ventes:</strong> Description analysée automatiquement (4 premiers mots)
            </p>
            <p>
              <strong>Formats supportés:</strong> CSV, Excel (.xlsx, .xls)
            </p>
          </div>
        </div>

        {/* Templates */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => downloadTemplate("stock")}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Télécharger template Stock</span>
          </button>
          <button
            onClick={() => downloadTemplate("sales")}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium">Télécharger template Ventes</span>
          </button>
        </div>

        {/* Import Stock */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Import Stock
            </h3>

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
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {stockFile ? stockFile.name : "Cliquez pour sélectionner un fichier"}
                </p>
              </label>
            </div>

            {stockData.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowStockPreview(!showStockPreview)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4" />
                  {showStockPreview ? "Masquer" : "Voir"} l'aperçu ({stockData.length} lignes)
                </button>

                {showStockPreview && (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                    <div className="text-xs space-y-1">
                      {stockPreview.map((row, index) => (
                        <div key={index} className="border-b border-gray-200 pb-1">
                          <strong>{row["Item name"] || "N/A"}</strong> - {row["Variations"] || "N/A"}(
                          {row["Price"] || "0"}€, Qty: {row["Quantity"] || "0"})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStockImport}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Importer le Stock ({stockData.length} articles)
                </button>
              </div>
            )}
          </div>

          {/* Import Ventes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Import Ventes
            </h3>

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
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {salesFile ? salesFile.name : "Cliquez pour sélectionner un fichier"}
                </p>
              </label>
            </div>

            {salesData.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowSalesPreview(!showSalesPreview)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4" />
                  {showSalesPreview ? "Masquer" : "Voir"} l'aperçu ({salesData.length} lignes)
                </button>

                {showSalesPreview && (
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-auto">
                    <div className="text-xs space-y-1">
                      {salesPreview.map((row, index) => (
                        <div key={index} className="border-b border-gray-200 pb-1">
                          <strong>{row["Description"] || "N/A"}</strong>({row["Price"] || "0"}€, Qty:{" "}
                          {row["Quantity"] || "1"})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSalesImport}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Importer les Ventes ({salesData.length} ventes)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {loading && (
          <div className="mt-4 flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Analyse en cours...
          </div>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              message.includes("✅")
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {message.includes("✅") ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
