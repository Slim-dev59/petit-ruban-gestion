"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Upload,
  Settings,
  FileText,
  BarChart3,
  Archive,
  CreditCard,
} from "lucide-react"

import { CreatorManagement } from "@/components/creator-management"
import { StockOverview } from "@/components/stock-overview"
import { ImportFiles } from "@/components/import-files"
import { SettingsPanel } from "@/components/settings-panel"
import { SalesAnalytics } from "@/components/sales-analytics"
import { ArchiveManagement } from "@/components/archive-management"
import { PaymentManagement } from "@/components/payment-management"
import { ParticipationManagement } from "@/components/participation-management"
import { AuthGuard } from "@/components/auth/auth-guard"
import { UserMenu } from "@/components/auth/user-menu"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showImport, setShowImport] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [stats, setStats] = useState({
    creators: 0,
    products: 0,
    sales: 0,
    revenue: 0,
  })

  useEffect(() => {
    const updateStats = () => {
      const creators = JSON.parse(localStorage.getItem("creators") || "[]")
      const stock = JSON.parse(localStorage.getItem("stock") || "[]")
      const sales = JSON.parse(localStorage.getItem("sales") || "[]")

      const revenue = sales.reduce((sum: number, sale: any) => sum + (sale.montant || 0), 0)

      setStats({
        creators: creators.length,
        products: stock.length,
        sales: sales.length,
        revenue,
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-force-black">Boutique Multi-Créateurs</h1>
                <Badge variant="secondary" className="ml-3 text-force-black">
                  v2.0
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setShowImport(true)} className="text-force-black">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>

                <Button variant="outline" onClick={() => setShowSettings(true)} className="text-force-black">
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </Button>

                <UserMenu />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-modern">
            <TabsList className="tabs-list-modern grid w-full grid-cols-7">
              <TabsTrigger value="dashboard" className="tabs-trigger-modern">
                <BarChart3 className="h-4 w-4 mr-2" />
                Tableau de bord
              </TabsTrigger>
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
              <TabsTrigger value="payments" className="tabs-trigger-modern">
                <CreditCard className="h-4 w-4 mr-2" />
                Paiements
              </TabsTrigger>
              <TabsTrigger value="participations" className="tabs-trigger-modern">
                <FileText className="h-4 w-4 mr-2" />
                Participations
              </TabsTrigger>
              <TabsTrigger value="archives" className="tabs-trigger-modern">
                <Archive className="h-4 w-4 mr-2" />
                Archives
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="tabs-content-modern space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-force-black">Créateurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-force-black">{stats.creators}</div>
                    <p className="text-xs text-muted-foreground text-force-black">Créateurs actifs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-force-black">Produits</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-force-black">{stats.products}</div>
                    <p className="text-xs text-muted-foreground text-force-black">Articles en stock</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-force-black">Ventes</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-force-black">{stats.sales}</div>
                    <p className="text-xs text-muted-foreground text-force-black">Transactions totales</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-force-black">Chiffre d'affaires</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-force-black">{stats.revenue.toFixed(2)}€</div>
                    <p className="text-xs text-muted-foreground text-force-black">Total des ventes</p>
                  </CardContent>
                </Card>
              </div>

              <SalesAnalytics />
            </TabsContent>

            <TabsContent value="creators" className="tabs-content-modern">
              <CreatorManagement />
            </TabsContent>

            <TabsContent value="stock" className="tabs-content-modern">
              <StockOverview />
            </TabsContent>

            <TabsContent value="sales" className="tabs-content-modern">
              <SalesAnalytics />
            </TabsContent>

            <TabsContent value="payments" className="tabs-content-modern">
              <PaymentManagement />
            </TabsContent>

            <TabsContent value="participations" className="tabs-content-modern">
              <ParticipationManagement />
            </TabsContent>

            <TabsContent value="archives" className="tabs-content-modern">
              <ArchiveManagement />
            </TabsContent>
          </Tabs>
        </main>

        {showImport && <ImportFiles onClose={() => setShowImport(false)} />}

        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      </div>
    </AuthGuard>
  )
}
