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
import { Upload, Users, Package, TrendingUp, FileText, CreditCard, Settings, AlertCircle, Zap } from "lucide-react"
import { HomeIcon } from "lucide-react"

function AppContent() {
  const { settings, getTotalPendingSales } = useStore()
  const pendingSalesCount = getTotalPendingSales()

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
                <h1 className="text-2xl font-bold text-slate-900">{settings.shopName}</h1>
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
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="h-auto w-full bg-slate-100 rounded-2xl p-2 grid grid-cols-8 gap-2">
              <TabsTrigger
                value="import"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Import</span>
                  {pendingSalesCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center">
                      {pendingSalesCount > 99 ? "99+" : pendingSalesCount}
                    </span>
                  )}
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="creators"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Créateurs</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="stock"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Stock</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="sales"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Ventes</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="reports"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Rapports</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="payments"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Paiements</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="participations"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <HomeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Loyers</span>
                </div>
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className="relative h-12 rounded-xl border-0 bg-transparent text-slate-900 font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-300"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Config</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Contenu avec fond moderne */}
            <div className="py-8">
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
