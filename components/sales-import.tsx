"use client"

import { useState, useMemo } from "react"
import { TrendingUp, Search, Trash2, Euro, Package, AlertCircle, CheckCircle } from "lucide-react"
import { useStore } from "@/lib/store"
import { exportToCSV } from "@/lib/sales-utils"

export default function SalesImport() {
  const { sales, creators, updateSale, deleteSale, reassignSale, bulkReassignSales } = useStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCreator, setSelectedCreator] = useState("")
  const [showUnidentifiedOnly, setShowUnidentifiedOnly] = useState(false)
  const [selectedSales, setSelectedSales] = useState<string[]>([])
  const [bulkCreatorId, setBulkCreatorId] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        sale.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.creatorName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCreator = !selectedCreator || sale.creatorId === selectedCreator
      const matchesUnidentified = !showUnidentifiedOnly || !sale.identified
      const matchesDate = !dateFilter || sale.date.startsWith(dateFilter)

      return matchesSearch && matchesCreator && matchesUnidentified && matchesDate
    })
  }, [sales, searchTerm, selectedCreator, showUnidentifiedOnly, dateFilter])

  const unidentifiedSales = sales.filter((sale) => !sale.identified)
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)
  const identifiedRevenue = sales
    .filter((sale) => sale.identified)
    .reduce((sum, sale) => sum + sale.price * sale.quantity, 0)

  const handleBulkReassign = () => {
    if (selectedSales.length > 0 && bulkCreatorId) {
      bulkReassignSales(selectedSales, bulkCreatorId)
      setSelectedSales([])
      setBulkCreatorId("")
    }
  }

  const exportSales = () => {
    const exportData = filteredSales.map((sale) => ({
      Date: sale.date,
      Description: sale.description,
      Article: sale.itemName,
      Créateur: sale.creatorName,
      "Prix unitaire": sale.price.toFixed(2),
      Quantité: sale.quantity,
      Total: (sale.price * sale.quantity).toFixed(2),
      Identifié: sale.identified ? "Oui" : "Non",
      Commission: sale.commission || 0,
      "Méthode paiement": sale.paymentMethod || "",
      Notes: sale.notes || "",
    }))

    exportToCSV(exportData, "ventes.csv")
  }

  const toggleSaleSelection = (saleId: string) => {
    setSelectedSales((prev) => (prev.includes(saleId) ? prev.filter((id) => id !== saleId) : [...prev, saleId]))
  }

  const selectAllVisible = () => {
    const visibleIds = filteredSales.map((sale) => sale.id)
    setSelectedSales(visibleIds)
  }

  const clearSelection = () => {
    setSelectedSales([])
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            Gestion des Ventes
          </h2>
          <button
            onClick={exportSales}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Exporter ({filteredSales.length})
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total ventes</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{sales.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">CA total</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{totalRevenue.toFixed(2)}€</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">CA identifié</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{identifiedRevenue.toFixed(2)}€</p>
          </div>

          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">Non identifiées</span>
            </div>
            <p className="text-2xl font-bold text-red-900">{unidentifiedSales.length}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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

          <input
            type="month"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <label className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showUnidentifiedOnly}
              onChange={(e) => setShowUnidentifiedOnly(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Non identifiées</span>
          </label>

          <div className="flex gap-1">
            <button
              onClick={selectAllVisible}
              className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Tout sélectionner
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Désélectionner
            </button>
          </div>
        </div>

        {/* Actions en lot */}
        {selectedSales.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">{selectedSales.length} vente(s) sélectionnée(s)</span>
              <select
                value={bulkCreatorId}
                onChange={(e) => setBulkCreatorId(e.target.value)}
                className="p-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Réassigner à...</option>
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkReassign}
                disabled={!bulkCreatorId}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Réassigner
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste des ventes */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectedSales.length === filteredSales.length && filteredSales.length > 0}
                    onChange={selectedSales.length === filteredSales.length ? clearSelection : selectAllVisible}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-4 font-semibold text-gray-900">Date</th>
                <th className="text-left p-4 font-semibold text-gray-900">Description</th>
                <th className="text-left p-4 font-semibold text-gray-900">Créateur</th>
                <th className="text-left p-4 font-semibold text-gray-900">Prix</th>
                <th className="text-left p-4 font-semibold text-gray-900">Qté</th>
                <th className="text-left p-4 font-semibold text-gray-900">Total</th>
                <th className="text-left p-4 font-semibold text-gray-900">Statut</th>
                <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${!sale.identified ? "bg-red-50" : ""}`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedSales.includes(sale.id)}
                      onChange={() => toggleSaleSelection(sale.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-4 text-sm text-gray-600">{sale.date}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-900">{sale.itemName}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{sale.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: creators.find((c) => c.id === sale.creatorId)?.color }}
                      ></span>
                      <span className={sale.identified ? "text-gray-900" : "text-red-600 font-medium"}>
                        {sale.creatorName}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 font-medium">{sale.price.toFixed(2)}€</td>
                  <td className="p-4">{sale.quantity}</td>
                  <td className="p-4 font-bold">{(sale.price * sale.quantity).toFixed(2)}€</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        sale.identified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sale.identified ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Identifiée
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Non identifiée
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {!sale.identified && (
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              reassignSale(sale.id, e.target.value)
                            }
                          }}
                          className="text-xs p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          defaultValue=""
                        >
                          <option value="">Réassigner...</option>
                          {creators
                            .filter((c) => c.name !== "Non identifié")
                            .map((creator) => (
                              <option key={creator.id} value={creator.id}>
                                {creator.name}
                              </option>
                            ))}
                        </select>
                      )}
                      <button onClick={() => deleteSale(sale.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune vente trouvée</p>
          </div>
        )}
      </div>
    </div>
  )
}
