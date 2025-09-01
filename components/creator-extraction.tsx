"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus, Check, X, Users } from "lucide-react"

export function CreatorExtraction() {
  const { getCurrentData, addCreator, updateCreator, deleteCreator } = useStore()
  const currentData = getCurrentData()
  const [isAdding, setIsAdding] = useState(false)
  const [newCreatorName, setNewCreatorName] = useState("")
  const [newCreatorCommission, setNewCreatorCommission] = useState(1.75)
  const [editingCreator, setEditingCreator] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ name: string; commission: number }>({ name: "", commission: 1.75 })

  const handleAddCreator = () => {
    addCreator({
      name: newCreatorName,
      commission: newCreatorCommission,
      isActive: true,
    })
    setIsAdding(false)
    setNewCreatorName("")
    setNewCreatorCommission(1.75)
  }

  const handleEditCreator = (creator: any) => {
    setEditingCreator(creator.id)
    setEditValues({ name: creator.name, commission: creator.commission })
  }

  const handleSaveEdit = (creatorId: string) => {
    updateCreator(creatorId, {
      name: editValues.name,
      commission: editValues.commission,
    })
    setEditingCreator(null)
  }

  const handleCancelEdit = () => {
    setEditingCreator(null)
    setEditValues({ name: "", commission: 1.75 })
  }

  const handleDeleteCreator = (creatorId: string) => {
    deleteCreator(creatorId)
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Créateurs</h2>
          <p className="text-gray-600">Ajoutez, modifiez ou supprimez les créateurs de votre boutique</p>
        </div>
      </div>

      {/* Ajout d'un créateur */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Créateur</CardTitle>
          <CardDescription>Entrez les informations du nouveau créateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAdding ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="creatorName">Nom du créateur</Label>
                <Input
                  id="creatorName"
                  value={newCreatorName}
                  onChange={(e) => setNewCreatorName(e.target.value)}
                  placeholder="Nom du créateur"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creatorCommission">Commission (%)</Label>
                <Input
                  id="creatorCommission"
                  type="number"
                  step="0.01"
                  value={newCreatorCommission}
                  onChange={(e) => setNewCreatorCommission(Number.parseFloat(e.target.value))}
                  placeholder="1.75"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddCreator}>Ajouter</Button>
              </div>
            </>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un créateur
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Liste des créateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Créateurs</CardTitle>
          <CardDescription>Visualisez et modifiez les créateurs existants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.creators.map((creator) => (
                  <TableRow key={creator.id}>
                    <TableCell className="font-medium">
                      {editingCreator === creator.id ? (
                        <Input
                          value={editValues.name}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                        />
                      ) : (
                        creator.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingCreator === creator.id ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editValues.commission}
                          onChange={(e) =>
                            setEditValues({ ...editValues, commission: Number.parseFloat(e.target.value) })
                          }
                        />
                      ) : (
                        `${creator.commission}%`
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingCreator === creator.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(creator.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditCreator(creator)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCreator(creator.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {currentData.creators.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun créateur trouvé</p>
              <p className="text-sm text-gray-400">Ajoutez des créateurs pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
