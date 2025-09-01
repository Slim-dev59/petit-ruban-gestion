"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { BarChart3, TrendingUp, Euro, Calendar } from "lucide-react"
import { useStore } from "@/lib/store"

export default function SalesAnalytics() {
  const { sales, creators } = useStore()

  const analyticsData = useMemo(() => {
    // Données par créateur
    const creatorData = creators
      .map((creator) => {
        const creatorSales = sales.filter((sale) => sale.creatorId === creator.id && sale.identified)
        const totalRevenue = creatorSales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
        const totalItems = creatorSales.reduce((sum, sale) => sum + sale.quantity, 0)

        return {
          name: creator.name,
          revenue: totalRevenue,
          items: totalItems,
          sales: creatorSales.length,
          color: creator.color,
        }
      })
      .filter((data) => data.revenue > 0)

    // Données par mois
    const monthlyData = sales.reduce(
      (acc, sale) => {
        if (!sale.identified) return acc

        const month = sale.date.substring(0, 7) // YYYY-MM
        if (!acc[month]) {
          acc[month] = { month, revenue: 0, sales: 0 }
        }
        acc[month].revenue += sale.price * sale.quantity
        acc[month].sales += 1
        return acc
      },
      {} as Record<string, { month: string; revenue: number; sales: number }>,
    )

    const monthlyArray = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))

    // Top articles
    const itemData = sales.reduce(
      (acc, sale) => {
        if (!sale.identified) return acc

        const key = `${sale.itemName} (${sale.creatorName})`
        if (!acc[key]) {
          acc[key] = { name: key, quantity: 0, revenue: 0 }
        }
        acc[key].quantity += sale.quantity
        acc[key].revenue += sale.price * sale.quantity
        return acc
      },
      {} as Record<string, { name: string; quantity: number; revenue: number }>,
    )

    const topItems = Object.values(itemData)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return { creatorData, monthlyArray, topItems }
  }, [sales, creators])

  const totalRevenue = sales.filter((s) => s.identified).reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
  const totalSales = sales.filter((s) => s.identified).length
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          Analyses des Ventes
        </h2>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">CA Total</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{totalRevenue.toFixed(2)}€</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Ventes</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{totalSales}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Panier moyen</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{averageOrderValue.toFixed(2)}€</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Créateurs actifs</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{analyticsData.creatorData.length}</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenus par créateur */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenus par Créateur</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.creatorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}€`, "Revenus"]} />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition des ventes */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Ventes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.creatorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {analyticsData.creatorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}€`, "Revenus"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Évolution mensuelle */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution Mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.monthlyArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "revenue" ? `${Number(value).toFixed(2)}€` : value,
                  name === "revenue" ? "Revenus" : "Ventes",
                ]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top articles */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Articles</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-3 font-semibold text-gray-900">Article</th>
                <th className="text-left p-3 font-semibold text-gray-900">Quantité vendue</th>
                <th className="text-left p-3 font-semibold text-gray-900">Revenus</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 font-medium">{item.quantity}</td>
                  <td className="p-3 font-bold">{item.revenue.toFixed(2)}€</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
