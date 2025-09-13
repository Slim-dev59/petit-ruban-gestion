"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Upload,
  FileText,
  Users,
  Package,
  ShoppingCart,
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react"
import { CreatorExtraction } from "./creator-extraction"
import { SalesImport } from "./sales-import"

interface ImportFilesProps {
  onClose: () => void
}

export function ImportFiles({ onClose }: ImportFilesProps) {
  const [activeTab, setActiveTab] = useState("creators")
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info")
  const [alertMessage, setAlertMessage] = useState("")
  const creatorsFileRef = useRef<HTMLInputElement>(null)
  const stockFileRef = useRef<HTMLInputElement>(null)

  const showNotification = (type: "success" | "error" | "warning" | "info", message: string) => {
    setAlertType(type)
    setAlertMessage(message)
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleCreatorsImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())

        if (!headers.includes("Nom") || !headers.includes("Commission")) {
          showNotification("error", 'Le fichier doit contenir les colonnes "Nom" et "Commission"')
          return
        }

        const creators = lines.slice(1).map((line, index) => {
          const values = line.split(",").map((v) => v.trim())
          const creator: any = { id: Date.now() + index }

          headers.forEach((header, i) => {
            if (header === "Commission") {
              creator[header.toLowerCase()] = Number.parseFloat(values[i]) || 30
            } else {
              creator[header.toLowerCase()] = values[i] || ""
            }
          })

          return creator
        })

        const existingCreators = JSON.parse(localStorage.getItem("creators") || "[]")
        const updatedCreators = [...existingCreators, ...creators]
        localStorage.setItem("creators", JSON.stringify(updatedCreators))

        showNotification("success", `${creators.length} créateurs importés avec succès`)
      } catch (error) {
        showNotification("error", "Erreur lors de l'import du fichier créateurs")
      }
    }
    reader.readAsText(file)
  }

  const handleStockImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim())

        if (!headers.includes("Nom") || !headers.includes("Prix") || !headers.includes("Créateur")) {
          showNotification("error", 'Le fichier doit contenir les colonnes "Nom", "Prix" et "Créateur"')
          return
        }

        const stock = lines.slice(1).map((line, index) => {
          const values = line.split(",").map((v) => v.trim())
          const item: any = { id: Date.now() + index }

          headers.forEach((header, i) => {
            if (header === "Prix") {
              item[header.toLowerCase()] = Number.parseFloat(values[i]) || 0
            } else if (header === "Quantité") {
              item.quantite = Number.parseInt(values[i]) || 1
            } else {
              item[header.toLowerCase()] = values[i] || ""
            }
          })

          return item
        })

        const existingStock = JSON.parse(localStorage.getItem("stock") || "[]")
        const updatedStock = [...existingStock, ...stock]
        localStorage.setItem("stock", JSON.stringify(updatedStock))

        showNotification("success", `${stock.length} articles importés avec succès`)
      } catch (error) {
        showNotification("error", "Erreur lors de l'import du fichier stock")
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = (type: "creators" | "stock") => {
    let csvContent = ""
    let filename = ""

    if (type === "creators") {
      csvContent = "Nom,Commission,Email,Téléphone\nExemple Créateur,30,exemple@email.com,0123456789"
      filename = "template-createurs.csv"
    } else {
      csvContent =
        "Nom,Prix,Créateur,Quantité,Description\nExemple Article,25.99,Exemple Créateur,5,Description de l'article"
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

    showNotification("success", `Template ${type} téléchargé`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-force-black">
              <Upload className="h-5 w-5" />
              Import de données
            </CardTitle>
            <CardDescription className="text-force-black">
              Importez vos créateurs, stock, ventes et extrayez des données
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose} className="text-force-black bg-transparent">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          {showAlert && (
            <Alert
              className={`mb-4 ${
                alertType === "success"
                  ? "border-green-500 bg-green-50"
                  : alertType === "error"
                    ? "border-red-500 bg-red-50"
                    : alertType === "warning"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-blue-500 bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-2">
                {alertType === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                {alertType === "error" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                {alertType === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                {alertType === "info" && <Info className="h-4 w-4 text-blue-600" />}
                <AlertDescription className="text-force-black">{alertMessage}</AlertDescription>
              </div>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-modern">
            <TabsList className="tabs-list-modern grid w-full grid-cols-4">
              <TabsTrigger value="creators" className="tabs-trigger-modern">
                <Users className="h-4 w-4 mr-2" />
                Créateurs
              </TabsTrigger>
              <TabsTrigger value="stock" className="tabs-trigger-modern">
                <Package className="h-4 w-4 mr-2" />
                Stock
              </TabsTrigger>
              <TabsTrigger value="sales" className="tabs-trigger-modern">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ventes
              </TabsTrigger>
              <TabsTrigger value="extraction" className="tabs-trigger-modern">
                <FileText className="h-4 w-4 mr-2" />
                Extraction
              </TabsTrigger>
            </TabsList>

            <TabsContent value="creators" className="tabs-content-modern space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-force-black">Import des créateurs</CardTitle>
                  <CardDescription className="text-force-black">
                    Importez une liste de créateurs depuis un fichier CSV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={() => downloadTemplate("creators")} variant="outline" className="text-force-black">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le template
                    </Button>

                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCreatorsImport}
                      className="hidden"
                      ref={creatorsFileRef}
                    />
                    <Button onClick={() => creatorsFileRef.current?.click()} className="text-force-black">
                      <Upload className="h-4 w-4 mr-2" />
                      Importer le fichier
                    </Button>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-force-black">
                      <strong>Format requis :</strong> Colonnes "Nom" et "Commission" obligatoires. Colonnes
                      optionnelles : Email, Téléphone.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock" className="tabs-content-modern space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-force-black">Import du stock</CardTitle>
                  <CardDescription className="text-force-black">
                    Importez votre inventaire depuis un fichier CSV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={() => downloadTemplate("stock")} variant="outline" className="text-force-black">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le template
                    </Button>

                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleStockImport}
                      className="hidden"
                      ref={stockFileRef}
                    />
                    <Button onClick={() => stockFileRef.current?.click()} className="text-force-black">
                      <Upload className="h-4 w-4 mr-2" />
                      Importer le fichier
                    </Button>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-force-black">
                      <strong>Format requis :</strong> Colonnes "Nom", "Prix" et "Créateur" obligatoires. Colonnes
                      optionnelles : Quantité, Description.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sales" className="tabs-content-modern">
              <SalesImport onNotification={showNotification} />
            </TabsContent>

            <TabsContent value="extraction" className="tabs-content-modern">
              <CreatorExtraction onNotification={showNotification} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
