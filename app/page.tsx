"use client"

import { useState, useEffect } from "react"
import { Store, Upload, Users, Package, TrendingUp, LogOut, Shield, Settings, FileText } from "lucide-react"
import { useStore } from "@/lib/store"
import LoginForm from "@/components/login-form"
import { MonthSelector } from "@/components/month-selector"

export default function Home() {
  const [activeTab, setActiveTab] = useState("import")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { setAuthenticated } = useStore()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check")
      const data = await response.json()
      console.log("Auth check result:", data)
      setIsAuthenticated(data.authenticated)
      setAuthenticated(data.authenticated)
    } catch (error) {
      console.error("Auth check error:", error)
      setIsAuthenticated(false)
      setAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = (success: boolean) => {
    console.log("Login callback with success:", success)
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
    { id: "ventes", label: "Ventes", icon: TrendingUp },
    { id: "createurs", label: "Créateurs", icon: Users },
    { id: "rapports", label: "Rapports", icon: FileText },
    { id: "archives", label: "Archives", icon: Package },
    { id: "parametres", label: "Paramètres", icon: Settings },
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
              <MonthSelector />
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
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenue dans Petit-Ruban v17</h2>
          <p className="text-gray-600 mb-8">Système de gestion multi-créateurs avec authentification sécurisée</p>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              Onglet actuel : {tabs.find((t) => t.id === activeTab)?.label}
            </h3>
            <p className="text-gray-600">Les composants pour cet onglet seront ajoutés dans les prochaines versions.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
