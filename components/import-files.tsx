"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  Download,
  Trash2,
  FileSpreadsheet,
  Database,
} from "lucide-react"
import { useStore } from "@/lib/store"
import { SalesImport } from "./sales-import"
import { CreatorExtraction } from "./creator-extraction"

interface ImportedFile {
  id: string
  name: string
  type: "creators" | "stock" | "sales"
  size: number
  data: any[]
  status: "pending" | "processed" | "error"
  preview?: any[]
}

export function ImportFiles() {
  const { addCreators, addStockData, creators, stockData } = useStore()
  const [importedFiles, setImportedFiles] = useState<ImportedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "creators" | "stock") => {
    const files = event.target.files
    if (!files) return

    setIsProcessing(true)
    setProcessingProgress(0)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileId = `${type}-${Date.now()}-${i}`

      try {
        const text = await file.text()
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

        const data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })
          return row
        })

        const newFile: ImportedFile = {
          id: fileId,
          name: file.name,
          type,
          size: file.size,
          data,
          status: "pending",
          preview: data.slice(0, 5),
        }

        setImportedFiles((prev) => [...prev, newFile])
        setProcessingProgress(((i + 1) / files.length) * 100)
      } catch (error) {
        console.error("Erreur lors du traitement du fichier:", error)
      }
    }

    setIsProcessing(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const processFile = (fileId: string) => {
    const file = importedFiles.find((f) => f.id === fileId)
    if (!file) return

    try {
      if (file.type === "creators") {
        const newCreators = file.data.map((row) => ({
          id: `creator-${Date.now()}-${Math.random()}`,
          name: row.nom || row.name || row.créateur || "",
          email: row.email || row.mail || "",
          phone: row.téléphone || row.phone || row.tel || "",
          address: row.adresse || row.address || "",
          commissionRate: Number.parseFloat(row.commission || row.taux || "0") || 0,
          isActive: true,
          createdAt: new Date().toISOString(),
        }))

        addCreators(newCreators)
      } else if (file.type === "stock") {
        const newStock = file.data.map((row) => ({
          id: `stock-${Date.now()}-${Math.random()}`,
          name: row.nom || row.name || row.article || "",
          description: row.description || row.desc || "",
          price: Number.parseFloat(row.prix || row.price || "0") || 0,
          quantity: Number.parseInt(row.quantité || row.quantity || row.stock || "0") || 0,
          creatorId: row.créateur_id || row.creator_id || "",
          category: row.catégorie || row.category || "Autre",
          createdAt: new Date().toISOString(),
        }))

        addStockData(newStock)
      }

      setImportedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "processed" as const } : f)))
    } catch (error) {
      console.error("Erreur lors du traitement:", error)
      setImportedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "error" as const } : f)))
    }
  }

  const removeFile = (fileId: string) => {
    setImportedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const downloadTemplate = (type: "creators" | "stock") => {
    let csvContent = ""
    let filename = ""

    if (type === "creators") {
      csvContent = "nom,email,téléphone,adresse,commission\n"
      csvContent += "Jean Dupont,jean@email.com,0123456789,123 rue Example,5.0\n"
      csvContent += "Marie Martin,marie@email.com,0987654321,456 avenue Test,3.5\n"
      filename = "template-createurs.csv"
    } else {
      csvContent = "nom,description,prix,quantité,créateur_id,catégorie\n"
      csvContent += "Produit 1,Description du produit,29.99,10,creator-123,Bijoux\n"
      csvContent += "Produit 2,Autre description,15.50,5,creator-456,Décoration\n"
      filename = "template-stock.csv"
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 text-force-black">
      <div className="tab-header">
        <div>
          <h2 className="tab-title">Import de données</h2>
          <p className="tab-description">Importez vos créateurs, stock et ventes depuis des fichiers CSV</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-black">
            <Users className="h-4 w-4 mr-1" />
            {creators.length} créateurs
          </Badge>
          <Badge variant="outline" className="text-black">
            <Package className="h-4 w-4 mr-1" />
            {stockData.length} articles
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="creators" className="tabs-modern">
        <TabsList className="tabs-list-modern">
          <TabsTrigger value="creators" className="tabs-trigger-modern">
            <Users className="h-4 w-4 mr-2" />
            Créateurs
          </TabsTrigger>
          <TabsTrigger value="stock" className="tabs-trigger-modern">
            <Package className="h-4 w-4 mr-2" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="sales" className="tabs-trigger-modern">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Ventes
          </TabsTrigger>
          <TabsTrigger value="extraction" className="tabs-trigger-modern">
            <Database className="h-4 w-4 mr-2" />
            Extraction
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creators" className="tabs-content-modern">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Users className="h-5 w-5" />
                  Import des créateurs
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Importez vos créateurs depuis un fichier CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="creators-file" className="text-black">
                      Fichier CSV des créateurs
                    </Label>
                    <Input
                      id="creators-file"
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={(e) => handleFileUpload(e, "creators")}
                      className="mt-2 text-black"
                    />
                  </div>
                  <Button variant="outline" onClick={() => downloadTemplate("creators")} className="text-black">
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black">Traitement en cours...</span>
                      <span className="text-sm text-slate-500">{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fichiers importés pour créateurs */}
            {importedFiles.filter((f) => f.type === "creators").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Fichiers importés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {importedFiles
                      .filter((f) => f.type === "creators")
                      .map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-slate-500" />
                            <div>
                              <p className="font-medium text-black">{file.name}</p>
                              <p className="text-sm text-slate-500">
                                {file.data.length} entrées • {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.status === "pending" && (
                              <Button size="sm" onClick={() => processFile(file.id)}>
                                <Upload className="h-4 w-4 mr-2" />
                                Traiter
                              </Button>
                            )}
                            {file.status === "processed" && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Traité
                              </Badge>
                            )}
                            {file.status === "error" && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Erreur
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stock" className="tabs-content-modern">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Package className="h-5 w-5" />
                  Import du stock
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Importez vos articles en stock depuis un fichier CSV
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="stock-file" className="text-black">
                      Fichier CSV du stock
                    </Label>
                    <Input
                      id="stock-file"
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={(e) => handleFileUpload(e, "stock")}
                      className="mt-2 text-black"
                    />
                  </div>
                  <Button variant="outline" onClick={() => downloadTemplate("stock")} className="text-black">
                    <Download className="h-4 w-4 mr-2" />
                    Template
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-black">Traitement en cours...</span>
                      <span className="text-sm text-slate-500">{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Fichiers importés pour stock */}
            {importedFiles.filter((f) => f.type === "stock").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-black">Fichiers importés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {importedFiles
                      .filter((f) => f.type === "stock")
                      .map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-slate-500" />
                            <div>
                              <p className="font-medium text-black">{file.name}</p>
                              <p className="text-sm text-slate-500">
                                {file.data.length} entrées • {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.status === "pending" && (
                              <Button size="sm" onClick={() => processFile(file.id)}>
                                <Upload className="h-4 w-4 mr-2" />
                                Traiter
                              </Button>
                            )}
                            {file.status === "processed" && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Traité
                              </Badge>
                            )}
                            {file.status === "error" && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Erreur
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="sales" className="tabs-content-modern">
          <SalesImport />
        </TabsContent>

        <TabsContent value="extraction" className="tabs-content-modern">
          <CreatorExtraction />
        </TabsContent>
      </Tabs>
    </div>
  )
}
