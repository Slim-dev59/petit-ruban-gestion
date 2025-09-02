"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit2, Trash2, Plus, Check, X, Users } from "lucide-react"

export function CreatorManagement() {
  const { creators, addCreator, removeCreator } = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newCreatorName, setNewCreatorName] = useState("")
  const [editingCreator, setEditingCreator] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleAddCreator = () => {
    if (newCreatorName.trim()) {
      addCreator(newCreatorName.trim())
      setIsAdding(false)
      setNewCreatorName("")
    }
  }

  const handleEditCreator = (creator: string) => {
    setEditingCreator(creator)
    setEditValue(creator)
  }

  const handleSaveEdit = (oldName: string) => {
    if (editValue.trim() && editValue !== oldName) {
      removeCreator(oldName)
      addCreator(editValue.trim())
    }
    setEditingCreator(null)
    setEditValue("")
  }

  const handleCancelEdit = () => {
    setEditingCreator(null)
    setEditValue("")
  }

  const handleDeleteCreator = (creator: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le créateur "${creator}" ?`)) {
      removeCreator(creator)
    }
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
          <CardDescription>Entrez le nom du nouveau créateur</CardDescription>
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
                  onKeyPress={(e) => e.key === "Enter" && handleAddCreator()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddCreator} disabled={!newCreatorName.trim()}>
                  Ajouter
                </Button>
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
          <CardTitle>Liste des Créateurs ({creators.length})</CardTitle>
          <CardDescription>Visualisez et modifiez les créateurs existants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creators.map((creator) => (
                  <TableRow key={creator}>
                    <TableCell className="font-medium">
                      {editingCreator === creator ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSaveEdit(creator)}
                          className="max-w-xs"
                        />
                      ) : (
                        creator
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {editingCreator === creator ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveEdit(creator)}
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
                              onClick={() => handleDeleteCreator(creator)}
                              className="h-8 w-8 p-0"
                              disabled={creator === "Non identifié"}
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

          {creators.length === 0 && (
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
