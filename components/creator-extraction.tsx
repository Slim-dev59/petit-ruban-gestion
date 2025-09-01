"use client"

import { useState } from "react"
import { Users, Plus, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react"
import { useStore } from "@/lib/store"

export default function CreatorExtraction() {
  const { creators, addCreator, updateCreator, deleteCreator, getStockByCreator, getSalesByCreator } = useStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCreator, setEditingCreator] = useState<string | null>(null)
  const [newCreator, setNewCreator] = useState({
    name: "",
    commission: 15,
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  const handleAddCreator = () => {
    if (newCreator.name.trim()) {
      addCreator({
        name: newCreator.name.trim(),
        commission: newCreator.commission,
        totalSales: 0,
        totalItems: 0,
        color: "",
        email: newCreator.email,
        phone: newCreator.phone,
        address: newCreator.address,
        notes: newCreator.notes,
      })
      setNewCreator({
        name: "",
        commission: 15,
        email: "",
        phone: "",
        address: "",
        notes: "",
      })
      setShowAddForm(false)
    }
  }

  const handleUpdateCreator = (id: string, updates: any) => {
    updateCreator(id, updates)
    setEditingCreator(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-600" />
            Gestion des Créateurs
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter un créateur
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total créateurs</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{creators.length}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Créateurs actifs</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{creators.filter((c) => c.totalSales > 0).length}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Commission moyenne</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {creators.length > 0
                ? (creators.reduce((sum, c) => sum + c.commission, 0) / creators.length).toFixed(1)
                : 0}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter un nouveau créateur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
              <input
                type="text"
                value={newCreator.name}
                onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nom du créateur"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission (%)</label>
              <input
                type="number"
                value={newCreator.commission}
                onChange={(e) => setNewCreator({ ...newCreator, commission: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={newCreator.email}
                onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input
                type="tel"
                value={newCreator.phone}
                onChange={(e) => setNewCreator({ ...newCreator, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input
                type="text"
                value={newCreator.address}
                onChange={(e) => setNewCreator({ ...newCreator, address: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Adresse complète"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={newCreator.notes}
                onChange={(e) => setNewCreator({ ...newCreator, notes: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Notes supplémentaires..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddCreator}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des créateurs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-900">Créateur</th>
                <th className="text-left p-4 font-semibold text-gray-900">Contact</th>
                <th className="text-left p-4 font-semibold text-gray-900">Commission</th>
                <th className="text-left p-4 font-semibold text-gray-900">Articles</th>
                <th className="text-left p-4 font-semibold text-gray-900">Ventes</th>
                <th className="text-left p-4 font-semibold text-gray-900">CA Total</th>
                <th className="text-left p-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => {
                const stockItems = getStockByCreator(creator.id)
                const sales = getSalesByCreator(creator.id)
                const totalRevenue = sales.reduce((sum, sale) => sum + sale.price * sale.quantity, 0)

                return (
                  <tr key={creator.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-block w-4 h-4 rounded-full"
                          style={{ backgroundColor: creator.color }}
                        ></span>
                        <div>
                          <p className="font-medium text-gray-900">{creator.name}</p>
                          {creator.notes && <p className="text-sm text-gray-500 truncate max-w-xs">{creator.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {creator.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {creator.email}
                          </div>
                        )}
                        {creator.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {creator.phone}
                          </div>
                        )}
                        {creator.address && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-xs">{creator.address}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{creator.commission}%</td>
                    <td className="p-4">{stockItems.length}</td>
                    <td className="p-4">{sales.length}</td>
                    <td className="p-4 font-bold">{totalRevenue.toFixed(2)}€</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCreator(creator.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCreator(creator.id)}
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

        {creators.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun créateur enregistré</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ajouter le premier créateur
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
