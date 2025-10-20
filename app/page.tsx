"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImportFiles } from "@/components/import-files"
import { SalesImport } from "@/components/sales-import"
import { CreatorManagement } from "@/components/creator-management"
import { StockOverview } from "@/components/stock-overview"
import { PDFGenerator } from "@/components/pdf-generator"
import { PaymentManagement } from "@/components/payment-management"
import { ParticipationManagement } from "@/components/participation-management"
import { SettingsPanel } from "@/components/settings-panel"
import { SalesAnalytics } from "@/components/sales-analytics"
import { ArchiveManagement } from "@/components/archive-management"
import { CreatorStockAssignment } from "@/components/creator-stock-assignment"
import { RentInvoiceGenerator } from "@/components/rent-invoice-generator"
import { AuthGuard } from "@/components/auth/auth-guard"
import { UserMenu } from "@/components/auth/user-menu"
import { Badge } from "@/components/ui/badge"
import { Upload, Users, Package, FileText, DollarSign, Settings, BarChart3, Archive, Link, Receipt } from "lucide-react"
import { useStore } from "@/lib/store"

export default function Home() {
  const { getTotalPendingSales } = useStore()
  const pendingSalesCount = getTotalPendingSales()

  return (
    <AuthGuard>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Gestion Multi-Créateurs
              </h1>
              <p className="text-slate-600 mt-2">Tableau de bord complet pour votre boutique</p>
            </div>
            <UserMenu />
          </div>

          <Tabs defaultValue="import" className="space-y-6">
            <TabsList className="grid grid-cols-6 lg:grid-cols-12 gap-2 h-auto p-2 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="import" className="flex flex-col gap-1 h-auto py-3">
                <Upload className="h-4 w-4" />
                <span className="text-xs">Import</span>
              </TabsTrigger>
              <TabsTrigger value="sales" className="flex flex-col gap-1 h-auto py-3 relative">
                <Upload className="h-4 w-4" />
                <span className="text-xs">Ventes</span>
                {pendingSalesCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {pendingSalesCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="assign" className="flex flex-col gap-1 h-auto py-3">
                <Link className="h-4 w-4" />
                <span className="text-xs">Assigner</span>
              </TabsTrigger>
              <TabsTrigger value="creators" className="flex flex-col gap-1 h-auto py-3">
                <Users className="h-4 w-4" />
                <span className="text-xs">Créateurs</span>
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex flex-col gap-1 h-auto py-3">
                <Package className="h-4 w-4" />
                <span className="text-xs">Stock</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex flex-col gap-1 h-auto py-3">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs">Analyses</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex flex-col gap-1 h-auto py-3">
                <FileText className="h-4 w-4" />
                <span className="text-xs">Rapports</span>
              </TabsTrigger>
              <TabsTrigger value="rent-invoices" className="flex flex-col gap-1 h-auto py-3">
                <Receipt className="h-4 w-4" />
                <span className="text-xs">Factures</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex flex-col gap-1 h-auto py-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Paiements</span>
              </TabsTrigger>
              <TabsTrigger value="participations" className="flex flex-col gap-1 h-auto py-3">
                <Link className="h-4 w-4" />
                <span className="text-xs">Loyers</span>
              </TabsTrigger>
              <TabsTrigger value="archives" className="flex flex-col gap-1 h-auto py-3">
                <Archive className="h-4 w-4" />
                <span className="text-xs">Archives</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col gap-1 h-auto py-3">
                <Settings className="h-4 w-4" />
                <span className="text-xs">Réglages</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import">
              <ImportFiles />
            </TabsContent>

            <TabsContent value="sales">
              <SalesImport />
            </TabsContent>

            <TabsContent value="assign">
              <CreatorStockAssignment />
            </TabsContent>

            <TabsContent value="creators">
              <CreatorManagement />
            </TabsContent>

            <TabsContent value="stock">
              <StockOverview />
            </TabsContent>

            <TabsContent value="analytics">
              <SalesAnalytics />
            </TabsContent>

            <TabsContent value="reports">
              <PDFGenerator />
            </TabsContent>

            <TabsContent value="rent-invoices">
              <RentInvoiceGenerator />
            </TabsContent>

            <TabsContent value="payments">
              <PaymentManagement />
            </TabsContent>

            <TabsContent value="participations">
              <ParticipationManagement />
            </TabsContent>

            <TabsContent value="archives">
              <ArchiveManagement />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </AuthGuard>
  )
}
