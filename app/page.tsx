"use client"

import { useState, useEffect } from "react"
import { Store, Upload, BarChart3, Users, Package, TrendingUp, LogOut, Shield } from "lucide-react"
import { useStore } from "@/lib/store"
import { identifyCreatorFromDescription } from "@/lib/sales-utils"
import LoginForm from "@/components/login-form"
import ImportFiles from "@/components/import-files"
import StockOverview from "@/components/stock-overview"
import CreatorExtraction from "@/components/creator-extraction"
import SalesImport from "@/components/sales-import"
import SalesAnalytics from "@/components/sales-analytics"

export default function Home() {
  const [activeTab, setActiveTab] = useState("import")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { addCreator, getCreatorByName, addStockItems, addSales, creators, setAuthenticated } = useStore()

  useEffect(() => {
    // Vérifier l'authentification au chargement
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check")
      const data = await response.json()
      setIsAuthenticated(data.authenticated)
      setAuthenticated(data.authenticated)
    } catch (error) {
      setIsAuthenticated(false)
      setAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success)
    setAuthenticated(success)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setIsAuthenticated(false)
      setAuthenticated(false)
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  const handleStockImport = (data: any[]) => {
    const stockItems: any[] = []

    data.forEach((row) => {
      // Logique EXACTE : Item name = créateur, Variations = article
      const creatorName = row["Item name"] || row["item_name"] || row["creator"] || ""
      const itemName = row["Variations"] || row["variations"] || row["item"] || row["name"] || ""
      const price = Number.parseFloat(row["Price"] || row["price"] || "0")
      const quantity = Number.parseInt(row["Quantity"] || row["quantity"] || row["stock"] || "0")

      if (!creatorName || !itemName) return

      // Créer le créateur s'il n'existe pas
      let creator = getCreatorByName(creatorName)
      if (!creator) {
        addCreator({
          name: creatorName,
          commission: 15,
          totalSales: 0,
          totalItems: 0,
          color: "",
        })
        creator = getCreatorByName(creatorName)
      }

      if (creator) {
        stockItems.push({
          creatorId: creator.id,
          creatorName: creator.name,
          name: itemName,
          price: price || 0,
          quantity: quantity || 0,
          category: row["Category"] || row["category"] || "",
        })
      }
    })

    if (stockItems.length > 0) {
      addStockItems(stockItems)
    }
  }

  const handleSalesImport = (data: any[]) => {
    const salesItems: any[] = []

    data.forEach((row) => {
      // Logique EXACTE : analyse des 4 premiers mots de la description
      const description = row["Description"] || row["description"] || row["item"] || ""
      const price = Number.parseFloat(row["Price"] || row["price"] || row["amount"] || "0")
      const quantity = Number.parseInt(row["Quantity"] || row["quantity"] || "1")
      const date = row["Date"] || row["date"] || new Date().toISOString().split("T")[0]

      if (!description) return

      // Identifier le créateur avec la logique des 4 premiers mots
      const identifiedCreator = identifyCreatorFromDescription(description, creators)

      if (identifiedCreator) {
        salesItems.push({
          creatorId: identifiedCreator.id,
          creatorName: identifiedCreator.name,
          itemName: description,
          price: price || 0,
          quantity: quantity || 1,
          date: date,
          description: description,
          identified: true,
        })
      } else {
        // Créer "Non identifié" si pas de match
        let nonIdentifiedCreator = getCreatorByName("Non identifié")
        if (!nonIdentifiedCreator) {
          addCreator({
            name: "Non identifié",
            commission: 0,
            totalSales: 0,
            totalItems: 0,
            color: "#6B7280",
          })
          nonIdentifiedCreator = getCreatorByName("Non identifié")
        }

        if (nonIdentifiedCreator) {
          salesItems.push({
            creatorId: nonIdentifiedCreator.id,
            creatorName: nonIdentifiedCreator.name,
            itemName: description,
            price: price || 0,
            quantity: quantity || 1,
            date: date,
            description: description,
            identified: false,
          })
        }
      }
    })

    if (salesItems.length > 0) {
      addSales(salesItems)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white animate-pulse" />
          </div>
          <p className="text-gray-600 text-lg">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  const tabs = [
    { id: "import", label: "Import", icon: Upload },
    { id: "stock", label: "Stock", icon: Package },
    { id: "creators", label: "Créateurs", icon: Users },
    { id: "sales", label: "Ventes", icon: TrendingUp },
    { id: "analytics", label: "Analyses", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Petit-Ruban</h1>
                <p className="text-xs text-gray-600">Gestion Multi-Créateurs v17</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Sécurisé</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "import" && <ImportFiles onStockImport={handleStockImport} onSalesImport={handleSalesImport} />}
        {activeTab === "stock" && <StockOverview />}
        {activeTab === "creators" && <CreatorExtraction />}
        {activeTab === "sales" && <SalesImport />}
        {activeTab === "analytics" && <SalesAnalytics />}
      </main>
    </div>
  )
}
