"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Users,
  Package,
  TrendingUp,
  Euro,
  FileText,
  Settings,
  Upload,
  BarChart3,
  CreditCard,
  Calendar,
} from "lucide-react"

import { useStore } from "@/lib/store"
import { useAuth } from "@/lib/auth"
import AuthGuard from "@/components/auth/auth-guard"
import CreatorManagement from "@/components/creator-management"
import StockOverview from "@/components/stock-overview"
import SalesImport from "@/components/sales-import"
import ImportFiles from "@/components/import-files"
import SalesAnalytics from "@/components/sales-analytics"
import PaymentManagement from "@/components/payment-management"
import ParticipationManagement from "@/components/participation-management"
import PdfGenerator from "@/components/pdf-generator"
import ArchiveManagement from "@/components/archive-management"
import SettingsPanel from "@/components/settings-panel"

function AppContent() {
  const { currentUser } = useAuth()
  const {
    creators,
    products,
    getTotalSales,
    getTotalCommissions,
    getTotalPendingSales,
    currentMonth,
    setCurrentMonth,
  } = useStore()

  const [activeTab, setActiveTab] = useState("dashboard")

  useEffect(() => {
    // Initialiser le mois courant si nécessaire
    if (!currentMonth) {
      setCurrentMonth(new Date().toISOString().slice(0, 7))
    }
  }, [currentMonth, setCurrentMonth])

  const totalSales = getTotalSales(currentMonth)
  const totalCommissions = getTotalCommissions(currentMonth)
  const pendingSales = getTotalPendingSales()
  const revenue = totalSales - totalCommissions

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Le Petit Ruban</h1>
                <p className="text-sm text-slate-600">Gestion Multi-Créateurs</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {pendingSales > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {pendingSales} vente{pendingSales > 1 ? "s" : ""} en attente
                </Badge>
              )}

              <div className="text-right">
                <p className="text-sm text-slate-600">Connecté en tant que</p>
                <p className="font-semibold text-slate-800">{currentUser?.username}</p>
              </div>

              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Créateurs</span>
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
            </TabsTrigger>
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Ventes</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Paiements</span>
            </TabsTrigger>
            <TabsTrigger value="participations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Participations</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Rapports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Ventes du mois</CardTitle>
                  <Euro className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{totalSales.toFixed(2)} €</div>
                  <p className="text-xs text-blue-700 mt-1">{currentMonth}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">Commissions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">{totalCommissions.toFixed(2)} €</div>
                  <p className="text-xs text-green-700 mt-1">Versées aux créateurs</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Revenus nets</CardTitle>
                  <Euro className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900">{revenue.toFixed(2)} €</div>
                  <p className="text-xs text-purple-700 mt-1">Après commissions</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Créateurs actifs</CardTitle>
                  <Users className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">{creators.filter((c) => c.isActive).length}</div>
                  <p className="text-xs text-orange-700 mt-1">Sur {creators.length} total</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu rapide</CardTitle>
                  <CardDescription>Statistiques générales de votre boutique</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Produits en stock</span>
                    <Badge variant="secondary">{products.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Ventes en attente</span>
                    <Badge variant={pendingSales > 0 ? "destructive" : "secondary"}>{pendingSales}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Mois actuel</span>
                    <Badge variant="outline">{currentMonth}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions rapides</CardTitle>
                  <CardDescription>Accès direct aux fonctionnalités principales</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => setActiveTab("import")} className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Importer des ventes
                  </Button>
                  <Button onClick={() => setActiveTab("creators")} className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Gérer les créateurs
                  </Button>
                  <Button onClick={() => setActiveTab("reports")} className="w-full justify-start" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Générer un rapport
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs */}
          <TabsContent value="creators">
            <CreatorManagement />
          </TabsContent>

          <TabsContent value="stock">
            <StockOverview />
          </TabsContent>

          <TabsContent value="sales">
            <SalesImport />
          </TabsContent>

          <TabsContent value="import">
            <ImportFiles />
          </TabsContent>

          <TabsContent value="analytics">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="participations">
            <ParticipationManagement />
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PdfGenerator />
              <ArchiveManagement />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  )
}
