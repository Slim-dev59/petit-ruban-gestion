"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImportFiles } from "@/components/import-files"
import { CreatorManagement } from "@/components/creator-management"
import { StockOverview } from "@/components/stock-overview"
import { SalesAnalytics } from "@/components/sales-analytics"
import { PDFGenerator } from "@/components/pdf-generator"
import { PaymentManagement } from "@/components/payment-management"
import { ParticipationManagement } from "@/components/participation-management"
import { SettingsPanel } from "@/components/settings-panel"
import { AuthGuard } from "@/components/auth/auth-guard"
import { UserMenu } from "@/components/auth/user-menu"
import { useStore } from "@/lib/store"
import {
  Upload,
  Users,
  Package,
  TrendingUp,
  FileText,
  CreditCard,
  Settings,
  AlertCircle,
  Zap,
  BarChart3,
  Euro,
  ShoppingBag,
} from "lucide-react"
import { HomeIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function AppContent() {
  const { settings, getTotalPendingSales, creators, stockData, monthlyData } = useStore()
  const pendingSalesCount = getTotalPendingSales()

  // Calculer les statistiques du tableau de bord
  const totalSales = Object.values(monthlyData).reduce((sum, month) => sum + month.salesData.length, 0)
  const totalRevenue = Object.values(monthlyData).reduce(
    (sum, month) => sum + month.salesData.reduce((monthSum, sale) => monthSum + (sale.montant || 0), 0),
    0,
  )
  const totalParticipations = Object.values(monthlyData).reduce((sum, month) => sum + month.participations.length, 0)
  const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header moderne avec glassmorphism */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            {/* Notifications à gauche */}
            <div className="flex-1">
              {pendingSalesCount > 0 && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-4 py-2 shadow-sm w-fit">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-semibold text-red-800">{pendingSalesCount} en attente</span>
                </div>
              )}
            </div>

            {/* Logo et titre centrés */}
            <div className="flex items-center space-x-4 flex-1 justify-center">
              {settings.logoUrl && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                  <img
                    src={settings.logoUrl || "/placeholder.svg"}
                    alt="Logo"
                    className="relative w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}
              <div className="text-center">
                <h1 className="text-2xl font-bold">{settings.shopName}</h1>
                <p className="text-sm font-medium text-slate-600">{settings.shopSubtitle}</p>
              </div>
            </div>

            {/* Menu utilisateur et statut à droite */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl px-3 py-2 shadow-sm">
                <Zap className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-800">Sécurisé</span>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation moderne avec design cards */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid grid-cols-9 gap-2">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Tableau de bord</span>
              </TabsTrigger>

              <TabsTrigger value="import" className="relative flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Import</span>
                {pendingSalesCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                    {pendingSalesCount > 99 ? "99+" : pendingSalesCount}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger value="creators" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Créateurs</span>
              </TabsTrigger>

              <TabsTrigger value="stock" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Stock</span>
              </TabsTrigger>

              <TabsTrigger value="sales" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Ventes</span>
              </TabsTrigger>

              <TabsTrigger value="reports" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Rapports</span>
              </TabsTrigger>

              <TabsTrigger value="payments" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Paiements</span>
              </TabsTrigger>

              <TabsTrigger value="participations" className="flex items-center space-x-2">
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Loyers</span>
              </TabsTrigger>

              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Config</span>
              </TabsTrigger>
            </TabsList>

            {/* Contenu avec fond moderne */}
            <div className="py-8">
              <TabsContent value="dashboard" className="mt-0">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Tableau de bord</h2>
                      <p className="text-slate-600 font-medium">Vue d'ensemble de votre activité</p>
                    </div>
                  </div>

                  {/* Indicateurs principaux */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-white border-slate-200 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Créateurs actifs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{creators.length}</div>
                        <p className="text-xs text-muted-foreground">
                          {creators.filter((c) => c.isActive).length} actifs
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Articles en stock</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stockData.length}</div>
                        <p className="text-xs text-muted-foreground">Inventaire total</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventes totales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalSales}</div>
                        <p className="text-xs text-muted-foreground">Transactions réalisées</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
                        <Euro className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalRevenue.toFixed(2)}€</div>
                        <p className="text-xs text-muted-foreground">Revenus générés</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Indicateurs secondaires */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="bg-white border-slate-200 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{averageSaleValue.toFixed(2)}€</div>
                        <p className="text-xs text-muted-foreground">Valeur moyenne par vente</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Participations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold">{totalParticipations}</div>
                        <p className="text-xs text-muted-foreground">Loyers enregistrés</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-white border-slate-200 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">Ventes en attente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl font-bold text-red-600">{pendingSalesCount}</div>
                        <p className="text-xs text-muted-foreground">À traiter</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Graphiques et analyses */}
                  <SalesAnalytics />
                </div>
              </TabsContent>

              <TabsContent value="import" className="mt-0">
                <ImportFiles />
              </TabsContent>

              <TabsContent value="creators" className="mt-0">
                <CreatorManagement />
              </TabsContent>

              <TabsContent value="stock" className="mt-0">
                <StockOverview />
              </TabsContent>

              <TabsContent value="sales" className="mt-0">
                <SalesAnalytics />
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <PDFGenerator />
              </TabsContent>

              <TabsContent value="payments" className="mt-0">
                <PaymentManagement />
              </TabsContent>

              <TabsContent value="participations" className="mt-0">
                <ParticipationManagement />
              </TabsContent>

              <TabsContent value="settings" className="mt-0">
                <SettingsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  )
}
