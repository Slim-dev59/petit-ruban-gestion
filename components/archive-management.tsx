"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Archive,
  CheckCircle,
  Clock,
  CreditCard,
  FileArchive,
  Plus,
  Send,
  AlertTriangle,
  Calendar,
  Bug,
  Eye,
} from "lucide-react"
import { useStore } from "@/lib/store"

export function ArchiveManagement() {
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

  const {
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
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case "valide":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Validé
          </Badge>
        )
      case "paye":
        return (
          <Badge variant="default" className="bg-green-600">
            <CreditCard className="h-3 w-3 mr-1" />
            Payé
          </Badge>
        )
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getVirementStatusBadge = (statut: string) => {
    switch (statut) {
      case "programme":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Programmé
          </Badge>
        )
      case "effectue":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Effectué
          </Badge>
        )
      case "echec":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Échec
          </Badge>
        )
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const periodOptions = generatePeriodOptions()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="archives" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="archives">Gestion des archives</TabsTrigger>
          <TabsTrigger value="debug">🐛 Debug des données</TabsTrigger>
        </TabsList>

        <TabsContent value="archives" className="space-y-6">
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
                      const periodLabel = new Date(
                        Number.parseInt(year),
                        Number.parseInt(month) - 1,
                      ).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                      })

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
                                <Badge variant="outline" className="text-xs">
                                  {virements.length} virement(s)
                                </Badge>
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
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug des données de ventes
              </CardTitle>
              <CardDescription>
                Analysez les données pour comprendre pourquoi les ventes ne sont pas trouvées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Données actuelles :</strong> {salesData.length} ventes totales, {creators.length} créateurs
                  configurés
                </AlertDescription>
              </Alert>

              {/* Échantillon des ventes */}
              <div className="space-y-2">
                <h4 className="font-medium">Échantillon des ventes (5 premières) :</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date brute</TableHead>
                      <TableHead>Créateur</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Paiement</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.slice(0, 5).map((sale, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono text-sm">{sale.date}</TableCell>
                        <TableCell>{sale.createur}</TableCell>
                        <TableCell>{sale.description}</TableCell>
                        <TableCell>{sale.prix}€</TableCell>
                        <TableCell>{sale.paiement}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Test de filtrage */}
              <div className="space-y-4">
                <h4 className="font-medium">Test de filtrage par période :</h4>
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                {selectedCreator && selectedPeriod && (
                  <Button
                    onClick={() => {
                      const debugSales = debugSalesForPeriod(selectedCreator, selectedPeriod)
                      alert(`${debugSales.length} ventes trouvées. Consultez la console pour les détails.`)
                    }}
                    variant="outline"
                    className="bg-transparent"
                  >
                    <Bug className="h-4 w-4 mr-2" />
                    Tester le filtrage (voir console)
                  </Button>
                )}
              </div>

              {/* Répartition par créateur */}
              <div className="space-y-2">
                <h4 className="font-medium">Répartition des ventes par créateur :</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {creators.map((creator) => {
                    const creatorSales = getSalesForCreator(creator)
                    return (
                      <div key={creator} className="p-2 border rounded">
                        <div className="font-medium text-sm">{creator}</div>
                        <div className="text-xs text-muted-foreground">{creatorSales.length} ventes</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pour créer une archive */}
      <Dialog open={showCreateArchive} onOpenChange={setShowCreateArchive}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle archive</DialogTitle>
            <DialogDescription>
              Sélectionnez un créateur et une période pour archiver les ventes mensuelles
            </DialogDescription>
          </DialogHeader>
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
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
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
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateArchive(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateArchive} disabled={!selectedCreator || !selectedPeriod}>
              Créer l'archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un virement */}
      <Dialog open={showAddVirement} onOpenChange={setShowAddVirement}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un virement</DialogTitle>
            <DialogDescription>Saisissez les détails du virement effectué</DialogDescription>
          </DialogHeader>
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
              <Textarea
                value={virementData.notes}
                onChange={(e) => setVirementData({ ...virementData, notes: e.target.value })}
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVirement(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddVirement}>
              <Send className="h-4 w-4 mr-2" />
              Enregistrer le virement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
