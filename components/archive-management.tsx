"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Trash2, Plus, Check, X, Users } from "lucide-react"
import { Archive, CheckCircle, Clock, CreditCard, FileArchive, Send, AlertTriangle, Eye } from "lucide-react"

export function ArchiveManagement() {
  const {
    getCurrentData,
    addCreator,
    updateCreator,
    deleteCreator,
    creators,
    archives,
    virements,
    salesData,
    createArchive,
    validateArchive,
    addVirement,
    updateVirementStatus,
    getArchivesForCreator,
    getVirementsForArchive,
    getSalesForCreator,
  } = useStore()
  const currentData = getCurrentData()
  const [isAdding, setIsAdding] = useState(false)
  const [newCreatorName, setNewCreatorName] = useState("")
  const [newCreatorCommission, setNewCreatorCommission] = useState(1.75)
  const [editingCreator, setEditingCreator] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ name: string; commission: number }>({ name: "", commission: 1.75 })
  const [selectedCreator, setSelectedCreator] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [showCreateArchive, setShowCreateArchive] = useState(false)
  const [showAddVirement, setShowAddVirement] = useState(false)
  const [selectedArchiveId, setSelectedArchiveId] = useState("")
  const [showDebug, setShowDebug] = useState(false)
  const [virementData, setVirementData] = useState({
    montant: "",
    dateVirement: "",
    reference: "",
    banque: "",
    notes: "",
  })

  // Générer les options de période (12 derniers mois)
  const generatePeriodOptions = () => {
    const options = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const label = date.toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
      options.push({ value: period, label })
    }
    return options
  }

  // Fonction de débogage pour analyser les ventes
  const debugSalesForPeriod = (createur: string, periode: string) => {
    console.log("=== DÉBUT DEBUG VENTES ===")
    console.log(`Créateur: ${createur}`)
    console.log(`Période: ${periode}`)

    const allSales = getSalesForCreator(createur)
    console.log(`Toutes les ventes pour ${createur}:`, allSales.length)

    if (allSales.length === 0) {
      console.log("❌ Aucune vente trouvée pour ce créateur")
      return []
    }

    console.log("Échantillon des ventes:")
    allSales.slice(0, 3).forEach((sale, index) => {
      console.log(`Vente ${index + 1}:`, {
        date: sale.date,
        description: sale.description,
        prix: sale.prix,
        createur: sale.createur,
      })
    })

    const [targetYear, targetMonth] = periode.split("-")
    console.log(`Période cible: Année ${targetYear}, Mois ${targetMonth}`)

    const filteredSales = allSales.filter((sale) => {
      console.log(`\n--- Analyse vente: ${sale.description} ---`)
      console.log(`Date brute: "${sale.date}"`)

      try {
        let saleDate: Date

        // Essayer différents formats de date
        if (sale.date.includes("/")) {
          // Format DD/MM/YYYY
          const parts = sale.date.split("/")
          console.log(`Format DD/MM/YYYY détecté: ${parts}`)
          if (parts.length === 3) {
            saleDate = new Date(Number.parseInt(parts[2]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[0]))
            console.log(`Date parsée (DD/MM/YYYY): ${saleDate.toISOString()}`)
          } else {
            throw new Error("Format DD/MM/YYYY invalide")
          }
        } else if (sale.date.includes("-")) {
          // Format YYYY-MM-DD ou DD-MM-YYYY
          const parts = sale.date.split("-")
          console.log(`Format avec tirets détecté: ${parts}`)
          if (parts[0].length === 4) {
            // Format YYYY-MM-DD
            saleDate = new Date(sale.date)
            console.log(`Date parsée (ISO): ${saleDate.toISOString()}`)
          } else {
            // Format DD-MM-YYYY
            saleDate = new Date(Number.parseInt(parts[2]), Number.parseInt(parts[1]) - 1, Number.parseInt(parts[0]))
            console.log(`Date parsée (DD-MM-YYYY): ${saleDate.toISOString()}`)
          }
        } else {
          // Essayer le parsing direct
          saleDate = new Date(sale.date)
          console.log(`Date parsée (direct): ${saleDate.toISOString()}`)
        }

        if (isNaN(saleDate.getTime())) {
          console.log(`❌ Date invalide après parsing`)
          return false
        }

        const saleYear = saleDate.getFullYear()
        const saleMonth = saleDate.getMonth() + 1 // +1 car getMonth() retourne 0-11

        console.log(`Date de la vente: Année ${saleYear}, Mois ${saleMonth}`)
        console.log(`Période cible: Année ${targetYear}, Mois ${targetMonth}`)

        const match = saleYear === Number.parseInt(targetYear) && saleMonth === Number.parseInt(targetMonth)
        console.log(`Match: ${match ? "✅" : "❌"}`)

        return match
      } catch (error) {
        console.error(`❌ Erreur parsing date "${sale.date}":`, error)
        return false
      }
    })

    console.log(`\n=== RÉSULTAT FINAL ===`)
    console.log(`Ventes filtrées: ${filteredSales.length}`)
    console.log("=== FIN DEBUG VENTES ===\n")

    return filteredSales
  }

  const handleCreateArchive = () => {
    if (!selectedCreator || !selectedPeriod) return

    // Debug avant création
    const debugSales = debugSalesForPeriod(selectedCreator, selectedPeriod)

    // Vérifier qu'il n'existe pas déjà une archive pour cette période
    const existingArchive = archives.find(
      (archive) => archive.createur === selectedCreator && archive.periode === selectedPeriod,
    )

    if (existingArchive) {
      alert("Une archive existe déjà pour cette période")
      return
    }

    if (debugSales.length === 0) {
      const confirm = window.confirm(
        `Aucune vente trouvée pour ${selectedCreator} en ${selectedPeriod}. Voulez-vous créer une archive vide ?`,
      )
      if (!confirm) return
    }

    const archiveId = createArchive(selectedCreator, selectedPeriod)
    setShowCreateArchive(false)
    setSelectedCreator("")
    setSelectedPeriod("")
  }

  const handleValidateArchive = (archiveId: string) => {
    validateArchive(archiveId, "Administrateur") // TODO: Récupérer l'utilisateur connecté
  }

  const handleAddVirement = () => {
    if (!selectedArchiveId || !virementData.montant || !virementData.dateVirement || !virementData.reference) return

    const archive = archives.find((a) => a.id === selectedArchiveId)
    if (!archive) return

    addVirement({
      archiveId: selectedArchiveId,
      createur: archive.createur,
      montant: Number.parseFloat(virementData.montant),
      dateVirement: virementData.dateVirement,
      reference: virementData.reference,
      banque: virementData.banque,
      statut: "effectue",
      notes: virementData.notes,
      creePar: "Administrateur", // TODO: Récupérer l'utilisateur connecté
    })

    setShowAddVirement(false)
    setSelectedArchiveId("")
    setVirementData({
      montant: "",
      dateVirement: "",
      reference: "",
      banque: "",
      notes: "",
    })
  }

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "en_attente":
        return (
          <div className="bg-orange-100 text-orange-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </div>
        )
      case "valide":
        return (
          <div className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-900">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validé
          </div>
        )
      case "paye":
        return (
          <div className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
            <CreditCard className="h-3 w-3 mr-1" />
            Payé
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-200 dark:text-gray-900">
            {statut}
          </div>
        )
    }
  }

  const getVirementStatusBadge = (statut: string) => {
    switch (statut) {
      case "programme":
        return (
          <div className="bg-orange-100 text-orange-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-orange-200 dark:text-orange-900">
            <Clock className="h-3 w-3 mr-1" />
            Programmé
          </div>
        )
      case "effectue":
        return (
          <div className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
            <CheckCircle className="h-3 w-3 mr-1" />
            Effectué
          </div>
        )
      case "echec":
        return (
          <div className="bg-red-100 text-red-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-red-200 dark:text-red-900">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Échec
          </div>
        )
      default:
        return (
          <div className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-200 dark:text-gray-900">
            {statut}
          </div>
        )
    }
  }

  const periodOptions = generatePeriodOptions()

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

      {/* Gestion des archives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Gestion des archives mensuelles
          </CardTitle>
          <CardDescription>
            Archivez et validez les ventes mensuelles par créateur, gérez les virements et la traçabilité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowCreateArchive(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Créer une nouvelle archive
          </Button>
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileArchive className="h-4 w-4" />
              Archives totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{archives.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {archives.filter((a) => a.statut === "en_attente").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Validées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {archives.filter((a) => a.statut === "valide").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {archives.filter((a) => a.statut === "paye").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des archives */}
      <Card>
        <CardHeader>
          <CardTitle>Archives existantes</CardTitle>
          <CardDescription>Gérez vos archives mensuelles et leurs virements associés</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Créateur</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Ventes</TableHead>
                <TableHead>CA</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net à verser</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {archives
                .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
                .map((archive) => {
                  const virements = getVirementsForArchive(archive.id)
                  const [year, month] = archive.periode.split("-")
                  const periodLabel = new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString(
                    "fr-FR",
                    {
                      year: "numeric",
                      month: "long",
                    },
                  )

                  return (
                    <TableRow key={archive.id}>
                      <TableCell className="font-medium">{archive.createur}</TableCell>
                      <TableCell>{periodLabel}</TableCell>
                      <TableCell>{archive.ventes.length}</TableCell>
                      <TableCell className="font-medium">{archive.totalCA.toFixed(2)}€</TableCell>
                      <TableCell className="text-red-600">{archive.totalCommission.toFixed(2)}€</TableCell>
                      <TableCell className="font-medium text-green-600">{archive.netAVerser.toFixed(2)}€</TableCell>
                      <TableCell>{getStatusBadge(archive.statut)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {archive.statut === "en_attente" && (
                            <Button size="sm" onClick={() => handleValidateArchive(archive.id)}>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Valider
                            </Button>
                          )}
                          {archive.statut === "valide" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedArchiveId(archive.id)
                                setVirementData({ ...virementData, montant: archive.netAVerser.toString() })
                                setShowAddVirement(true)
                              }}
                              className="bg-transparent"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Virer
                            </Button>
                          )}
                          {virements.length > 0 && (
                            <div className="bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-200 dark:text-gray-900">
                              {virements.length} virement(s)
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Historique des virements */}
      {virements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Historique des virements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {virements
                  .sort((a, b) => new Date(b.dateVirement).getTime() - new Date(a.dateVirement).getTime())
                  .map((virement) => (
                    <TableRow key={virement.id}>
                      <TableCell>{new Date(virement.dateVirement).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="font-medium">{virement.createur}</TableCell>
                      <TableCell className="font-medium">{virement.montant.toFixed(2)}€</TableCell>
                      <TableCell className="font-mono text-sm">{virement.reference}</TableCell>
                      <TableCell>{virement.banque}</TableCell>
                      <TableCell>{getVirementStatusBadge(virement.statut)}</TableCell>
                      <TableCell className="max-w-xs truncate" title={virement.notes}>
                        {virement.notes}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog pour créer une archive */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {showCreateArchive && (
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Créer une nouvelle archive</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Créateur</Label>
                <Select value={selectedCreator} onValueChange={setSelectedCreator}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un créateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {creators.map((creator) => (
                      <SelectItem key={creator} value={creator}>
                        {creator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Période</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une période" />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCreator && selectedPeriod && (
                <div className="bg-gray-100 p-4 rounded">
                  {(() => {
                    const debugSales = debugSalesForPeriod(selectedCreator, selectedPeriod)
                    return `${debugSales.length} vente(s) trouvée(s) pour cette période`
                  })()}
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2 bg-transparent"
                    onClick={() => {
                      debugSalesForPeriod(selectedCreator, selectedPeriod)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Voir détails
                  </Button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateArchive(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateArchive} disabled={!selectedCreator || !selectedPeriod}>
                Créer l'archive
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog pour ajouter un virement */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {showAddVirement && (
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Enregistrer un virement</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Montant (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={virementData.montant}
                  onChange={(e) => setVirementData({ ...virementData, montant: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Date du virement</Label>
                <Input
                  type="date"
                  value={virementData.dateVirement}
                  onChange={(e) => setVirementData({ ...virementData, dateVirement: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Référence du virement</Label>
                <Input
                  value={virementData.reference}
                  onChange={(e) => setVirementData({ ...virementData, reference: e.target.value })}
                  placeholder="Ex: VIR123456789"
                />
              </div>

              <div className="space-y-2">
                <Label>Banque</Label>
                <Input
                  value={virementData.banque}
                  onChange={(e) => setVirementData({ ...virementData, banque: e.target.value })}
                  placeholder="Ex: Crédit Agricole"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Input
                  value={virementData.notes}
                  onChange={(e) => setVirementData({ ...virementData, notes: e.target.value })}
                  placeholder="Notes additionnelles..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddVirement(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddVirement}>
                <Send className="h-4 w-4 mr-2" />
                Enregistrer le virement
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
