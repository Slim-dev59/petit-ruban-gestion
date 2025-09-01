"use client"

import { useState, useMemo } from "react"
import { Package, Search, AlertTriangle, TrendingUp, Euro, Edit, Trash2 } from "lucide-react"
import { useStore } from "@/lib/store"

export default function StockOverview() {
  const { stock, creators, updateStockItem, deleteStockItem } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCreator, setSelectedCreator] = useState("")
  const [showLowStock, setShowLowStock] = useState(false)

  const filteredStock = useMemo(() => {
    return stock.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCreator = !selectedCreator || item.creatorId === selectedCreator
      const matchesLowStock = !showLowStock || (item.minStock && item.quantity <= item.minStock)

      return matchesSearch && matchesCreator && matchesLowStock
    })
  }, [stock, searchTerm, selectedCreator, showLowStock])

  const totalValue = stock.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = stock.reduce((sum, item) => sum + item.quantity, 0)
  const lowStockItems = stock.filter((item) => item.minStock && item.quantity <= item.minStock)

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-7 h-7 text-blue-600" />
            Gestion du Stock
          </h2>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Articles</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{stock.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Quantité totale</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{totalItems}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Valeur stock</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{totalValue.toFixed(2)}€</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Stock faible</span>
            </div>
            <p className="text-2xl font-bold text-red-900">{lowStockItems.length}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCreator}
            onChange={(e) => setSelectedCreator(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les créateurs</option>
            {creators.map((creator) => (
              <option key={creator.id} value={creator.id}>
                {creator.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Stock faible uniquement</span>
          </label>

          <div className="text-sm text-gray-600 flex items-center justify-center">
            {filteredStock.length} article(s) affiché(s)
          </div>
        </div>
      </div>

      {/* Liste du stock */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">Article</th>
                <th className="text-left p-4 font-semibold text-gray-900">Créateur</th>
                <th className="text-left p-4 font-semibold text-gray-900">Catégorie</th>
                <th className="text-left p-4 font-semibold text-gray-900">Prix</th>
                <th className="text-left p-4 font-semibold text-gray-900">Quantité</th>
                <th className="text-left p-4 font-semibold text-gray-900">Valeur</th>
                <th className="text-left p-4 font-semibold text-gray-900">Statut</th>
                <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStock.map((item) => {
                const isLowStock = item.minStock && item.quantity <= item.minStock
                const totalValue = item.price * item.quantity

                return (
                  <tr
                    key={item.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${isLowStock ? "bg-red-50" : ""}`}
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.sku && <p className="text-sm text-gray-500">SKU: {item.sku}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: creators.find((c) => c.id === item.creatorId)?.color }}
                        ></span>
                        <span>{item.creatorName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{item.category || "-"}</td>
                    <td className="p-4 font-medium">{item.price.toFixed(2)}€</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={isLowStock ? "text-red-600 font-bold" : ""}>{item.quantity}</span>
                        {item.minStock && <span className="text-xs text-gray-500">/ {item.minStock} min</span>}
                      </div>
                    </td>
                    <td className="p-4 font-bold">{totalValue.toFixed(2)}€</td>
                    <td className="p-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Stock faible
                        </span>
                      ) : item.quantity === 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Épuisé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          En stock
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStockItem(item.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredStock.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  )
}
