"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Archive, CheckCircle, Clock, CreditCard, FileArchive, Send, AlertTriangle, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/sales-utils"

export function ArchiveManagement() {
  const {
    creators,
    archives,
    virements,
    salesData,
    createArchive,
    validateArchive,
    addVirement,
    getArchivesForCreator,
    getVirementsForArchive,
    getSalesForCreator,
    settings,
  } = useStore()

  const [selectedCreator, setSelectedCreator] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [showCreateArchive, setShowCreateArchive] = useState(false)
  const [showAddVirement, setShowAddVirement] = useState(false)
  const [selectedArchiveId, setSelectedArchiveId] = useState("")
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

  const handleCreateArchive = () => {
    if (!selectedCreator || !selectedPeriod) return

    // Vérifier qu'il n'existe pas déjà une archive pour cette période
    const existingArchive = archives.find(
      (archive) => archive.createur === selectedCreator && archive.periode === selectedPeriod,
    )

    if (existingArchive) {
      alert("Une archive existe déjà pour cette période")
      return
    }

    const archiveId = createArchive(selectedCreator, selectedPeriod)
    setShowCreateArchive(false)
    setSelectedCreator("")
    setSelectedPeriod("")
  }

  const handleValidateArchive = (archiveId: string) => {
    validateArchive(archiveId, "Administrateur")
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
      creePar: "Administrateur",
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
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case "valide":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validé
          </Badge>
        )
      case "paye":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CreditCard className="h-3 w-3 mr-1" />
            Payé
          </Badge>
        )
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const getVirementStatusBadge = (statut: string) => {
    switch (statut) {
      case "programme":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Programmé
          </Badge>
        )
      case "effectue":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Effectué
          </Badge>
        )
      case "echec":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Échec
          </Badge>
        )
      default:
        return <Badge variant="secondary">{statut}</Badge>
    }
  }

  const periodOptions = generatePeriodOptions()

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Archives</h2>
          <p className="text-gray-600">Archivez et validez les ventes mensuelles par créateur</p>
        </div>
      </div>

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
                      <TableCell className="font-medium">{formatCurrency(archive.totalCA)}</TableCell>
                      <TableCell className="text-red-600">{formatCurrency(archive.totalCommission)}</TableCell>
                      <TableCell className="font-medium text-green-600">{formatCurrency(archive.netAVerser)}</TableCell>
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
                          {virements.length > 0 && <Badge variant="outline">{virements.length} virement(s)</Badge>}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>

          {archives.length === 0 && (
            <div className="text-center py-8">
              <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune archive trouvée</p>
              <p className="text-sm text-gray-400">Créez votre première archive pour commencer</p>
            </div>
          )}
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
                      <TableCell className="font-medium">{formatCurrency(virement.montant)}</TableCell>
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
      {showCreateArchive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
                  <p className="text-sm">
                    {getSalesForCreator(selectedCreator).length} vente(s) trouvée(s) pour cette période
                  </p>
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
        </div>
      )}

      {/* Dialog pour ajouter un virement */}
      {showAddVirement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
        </div>
      )}
    </div>
  )
}
