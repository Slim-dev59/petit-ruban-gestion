"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, BarChart3, Users, FileText, Archive, Settings, Package, Calendar, DollarSign } from "lucide-react"
import { useStore } from "@/lib/store"
import { ImportFiles } from "@/components/import-files"
import { SalesAnalytics } from "@/components/sales-analytics"
import { CreatorManagement } from "@/components/creator-management"
import { PDFGenerator } from "@/components/pdf-generator"
import { ArchiveManagement } from "@/components/archive-management"
import { SettingsPanel } from "@/components/settings-panel"
import { StockOverview } from "@/components/stock-overview"

export default function Home() {
  const { creators, stockData, monthlyData, currentMonth, setCurrentMonth, settings } = useStore()
  const [activeTab, setActiveTab] = useState("import")

  // Obtenir tous les mois disponibles
  const availableMonths = Object.keys(monthlyData).sort().reverse()

  // Calculer les statistiques du mois courant
  const currentMonthData = monthlyData[currentMonth]
  const currentMonthSales = currentMonthData?.salesData.filter((sale) => sale.statut !== "payee") || []
  const currentMonthRevenue = currentMonthSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{settings.shopName}</h1>
                <p className="text-sm text-gray-500">Gestion Multi-Créateurs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Select value={currentMonth} onValueChange={setCurrentMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMonths.length > 0 ? (
                      availableMonths.map((month) => (
                        <SelectItem key={month} value={month}>
                          {new Date(month + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value={currentMonth}>
                        {new Date(currentMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {creators.length}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {stockData.length}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {currentMonthRevenue.toFixed(0)}€
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Ventes
            </TabsTrigger>
            <TabsTrigger value="creators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Créateurs
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="archives" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archives
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import">
            <ImportFiles />
          </TabsContent>

          <TabsContent value="analytics">
            <SalesAnalytics />
          </TabsContent>

          <TabsContent value="creators">
            <CreatorManagement />
          </TabsContent>

          <TabsContent value="stock">
            <StockOverview />
          </TabsContent>

          <TabsContent value="reports">
            <PDFGenerator />
          </TabsContent>

          <TabsContent value="archives">
            <ArchiveManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
