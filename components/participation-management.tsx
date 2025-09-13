"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Home,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Download,
  FileText,
  Plus,
} from "lucide-react"
import { useStore } from "@/lib/store"

export function ParticipationManagement() {
  const {
    creators,
    monthlyData,
    currentMonth,
    settings,
    updateSettings,
    addParticipation,
    updateParticipation,
    deleteParticipation,
    getAllParticipations,
    generateMonthlyParticipations,
  } = useStore()

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [editingParticipation, setEditingParticipation] = useState<any>(null)
  const [payingParticipation, setPayingParticipation] = useState<any>(null)
  const [paymentData, setPaymentData] = useState({
    datePaiement: new Date().toISOString().split("T")[0],
    modePaiement: "Virement",
    reference: "",
  })

  const availableMonths = Object.keys(monthlyData).sort().reverse()

  // Générer automatiquement les participations pour le mois courant
  useEffect(() => {
    generateMonthlyParticipations(selectedMonth)
  }, [selectedMonth, creators])

  // Obtenir les participations pour le mois sélectionné
  const getParticipationsForMonth = () => {
    const monthData = monthlyData[selectedMonth]
    return monthData ? monthData.participations : []
  }

  const participations = getParticipationsForMonth()

  // Calculer les statistiques
  const stats = {
    total: participations.length,
    paye: participations.filter((p) => p.statut === "paye").length,
    enAttente: participations.filter((p) => p.statut === "en_attente").length,
    enRetard: participations.filter((p) => p.statut === "en_retard").length,
    montantTotal: participations.reduce((sum, p) => sum + p.montantLoyer, 0),
    montantPaye: participations.filter((p) => p.statut === "paye").reduce((sum, p) => sum + p.montantLoyer, 0),
  }

  const handleEditParticipation = (participation: any) => {
    setEditingParticipation({ ...participation })
    setShowEditDialog(true)
  }

  const handleUpdateParticipation = () => {
    if (!editingParticipation) return

    updateParticipation(editingParticipation.id, editingParticipation)
    setShowEditDialog(false)
    setEditingParticipation(null)
  }

  const handleDeleteParticipation = (participationId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette participation ?")) {
      deleteParticipation(participationId)
    }
  }

  const handlePayParticipation = (participation: any) => {
    setPayingParticipation(participation)
    setPaymentData({
      datePaiement: new Date().toISOString().split("T")[0],
      modePaiement: "Virement",
      reference: `LOYER-${participation.createur}-${participation.mois}`,
    })
    setShowPaymentDialog(true)
  }

  const handleConfirmPayment = () => {
    if (!payingParticipation) return

    updateParticipation(payingParticipation.id, {
      statut: "paye",
      datePaiement: paymentData.datePaiement,
      modePaiement: paymentData.modePaiement,
      reference: paymentData.reference,
    })

    setShowPaymentDialog(false)
    setPayingParticipation(null)
  }

  const generateInvoice = (participation: any) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture de participation - ${participation.createur}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .shop-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .invoice-title { font-size: 20px; margin: 10px 0; }
          .invoice-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .info-section { background: #f8fafc; padding: 20px; border-radius: 8px; }
          .info-label { font-size: 14px; color: #666; margin-bottom: 5px; }
          .info-value { font-size: 16px; font-weight: bold; }
          .amount-section { background: #f0f9ff; border: 2px solid #0ea5e9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0; }
          .amount { font-size: 32px; font-weight: bold; color: #0ea5e9; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
          .status { padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
          .status-paye { background: #dcfce7; color: #166534; }
          .status-en-attente { background: #fef3c7; color: #92400e; }
          .status-en-retard { background: #fecaca; color: #991b1b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="shop-name">${settings.shopName}</div>
          <div class="invoice-title">Facture de participation mensuelle</div>
          <div>N° ${participation.id.slice(-8).toUpperCase()}</div>
        </div>

        <div class="invoice-info">
          <div class="info-section">
            <div class="info-label">Créateur</div>
            <div class="info-value">${participation.createur}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Période</div>
            <div class="info-value">${new Date(participation.mois + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Date d'échéance</div>
            <div class="info-value">${new Date(participation.dateEcheance).toLocaleDateString("fr-FR")}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Statut</div>
            <div class="info-value">
              <span class="status status-${participation.statut.replace("_", "-")}">
                ${participation.statut === "paye" ? "Payé" : participation.statut === "en_attente" ? "En attente" : "En retard"}
              </span>
            </div>
          </div>
        </div>

        <div class="amount-section">
          <div style="font-size: 18px; margin-bottom: 10px;">Montant de la participation</div>
          <div class="amount">${participation.montantLoyer.toFixed(2)}€</div>
        </div>

        ${
          participation.statut === "paye"
            ? `
        <div class="invoice-info">
          <div class="info-section">
            <div class="info-label">Date de paiement</div>
            <div class="info-value">${participation.datePaiement ? new Date(participation.datePaiement).toLocaleDateString("fr-FR") : "-"}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Mode de paiement</div>
            <div class="info-value">${participation.modePaiement || "-"}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Référence</div>
            <div class="info-value">${participation.reference || "-"}</div>
          </div>
          <div class="info-section">
            <div class="info-label">Notes</div>
            <div class="info-value">${participation.notes || "-"}</div>
          </div>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>Facture générée le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
          <p>${settings.shopName} - ${settings.shopSubtitle}</p>
        </div>
      </body>
      </html>
    `

    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()
    }
  }

  const exportParticipations = () => {
    const csvContent = [
      "Créateur,Mois,Montant,Échéance,Statut,Date paiement,Mode paiement,Référence,Notes",
      ...participations.map((p) =>
        [
          p.createur,
          p.mois,
          p.montantLoyer.toFixed(2),
          p.dateEcheance,
          p.statut,
          p.datePaiement || "",
          p.modePaiement || "",
          p.reference || "",
          `"${p.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `participations-${selectedMonth}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const addNewParticipation = () => {
    const newParticipation = {
      createur: "",
      mois: selectedMonth,
      montantLoyer: settings.loyerMensuel,
      dateEcheance: new Date(selectedMonth + "-01").toISOString().split("T")[0],
      statut: "en_attente" as const,
    }
    setEditingParticipation(newParticipation)
    setShowEditDialog(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des participations</h2>
          <p className="text-muted-foreground">Gérez les loyers mensuels des créateurs</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={addNewParticipation} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle participation
          </Button>
          <Button onClick={exportParticipations} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Configuration du loyer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label htmlFor="loyer-mensuel">Loyer mensuel par défaut (€)</Label>
              <Input
                id="loyer-mensuel"
                type="number"
                step="0.01"
                value={settings.loyerMensuel}
                onChange={(e) => updateSettings({ ...settings, loyerMensuel: Number.parseFloat(e.target.value) || 0 })}
                className="w-32"
              />
            </div>
            <div className="space-y-2">
              <Label>Mois sélectionné</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map((month) => (
                    <SelectItem key={month} value={month}>
                      {new Date(month + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total participations</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">créateurs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payées</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paye}</div>
            <p className="text-xs text-muted-foreground">{stats.montantPaye.toFixed(2)}€</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
            <p className="text-xs text-muted-foreground">à encaisser</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.enRetard}</div>
            <p className="text-xs text-muted-foreground">à relancer</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des participations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Participations -{" "}
            {new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune participation pour ce mois</p>
              <Button onClick={() => generateMonthlyParticipations(selectedMonth)} className="mt-4">
                Générer les participations
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Créateur</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Paiement</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participations.map((participation) => (
                  <TableRow key={participation.id}>
                    <TableCell className="font-medium">{participation.createur}</TableCell>
                    <TableCell className="text-right font-bold">{participation.montantLoyer.toFixed(2)}€</TableCell>
                    <TableCell>{new Date(participation.dateEcheance).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          participation.statut === "paye"
                            ? "default"
                            : participation.statut === "en_retard"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {participation.statut === "paye"
                          ? "Payé"
                          : participation.statut === "en_attente"
                            ? "En attente"
                            : "En retard"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {participation.datePaiement
                        ? new Date(participation.datePaiement).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{participation.reference || "-"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateInvoice(participation)}
                          title="Générer facture"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        {participation.statut !== "paye" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePayParticipation(participation)}
                            className="text-green-600 hover:text-green-700"
                            title="Marquer comme payé"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditParticipation(participation)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteParticipation(participation.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition de participation */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingParticipation?.id ? "Modifier la participation" : "Nouvelle participation"}
            </DialogTitle>
            <DialogDescription>
              {editingParticipation?.id
                ? "Modifiez les informations de cette participation"
                : "Créez une nouvelle participation"}
            </DialogDescription>
          </DialogHeader>

          {editingParticipation && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-createur">Créateur</Label>
                <Select
                  value={editingParticipation.createur}
                  onValueChange={(value) => setEditingParticipation({ ...editingParticipation, createur: value })}
                >
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
                <Label htmlFor="edit-montant">Montant du loyer (€)</Label>
                <Input
                  id="edit-montant"
                  type="number"
                  step="0.01"
                  value={editingParticipation.montantLoyer}
                  onChange={(e) =>
                    setEditingParticipation({
                      ...editingParticipation,
                      montantLoyer: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-echeance">Date d'échéance</Label>
                <Input
                  id="edit-echeance"
                  type="date"
                  value={editingParticipation.dateEcheance}
                  onChange={(e) => setEditingParticipation({ ...editingParticipation, dateEcheance: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-statut">Statut</Label>
                <Select
                  value={editingParticipation.statut}
                  onValueChange={(value) => setEditingParticipation({ ...editingParticipation, statut: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="paye">Payé</SelectItem>
                    <SelectItem value="en_retard">En retard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingParticipation.statut === "paye" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-date-paiement">Date de paiement</Label>
                    <Input
                      id="edit-date-paiement"
                      type="date"
                      value={editingParticipation.datePaiement || ""}
                      onChange={(e) =>
                        setEditingParticipation({ ...editingParticipation, datePaiement: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-mode-paiement">Mode de paiement</Label>
                    <Select
                      value={editingParticipation.modePaiement || ""}
                      onValueChange={(value) =>
                        setEditingParticipation({ ...editingParticipation, modePaiement: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Virement">Virement</SelectItem>
                        <SelectItem value="Espèces">Espèces</SelectItem>
                        <SelectItem value="Chèque">Chèque</SelectItem>
                        <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-reference-participation">Référence</Label>
                    <Input
                      id="edit-reference-participation"
                      value={editingParticipation.reference || ""}
                      onChange={(e) => setEditingParticipation({ ...editingParticipation, reference: e.target.value })}
                      placeholder="Référence du paiement"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-notes-participation">Notes</Label>
                <Textarea
                  id="edit-notes-participation"
                  value={editingParticipation.notes || ""}
                  onChange={(e) => setEditingParticipation({ ...editingParticipation, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (editingParticipation?.id) {
                  handleUpdateParticipation()
                } else {
                  addParticipation(editingParticipation)
                  setShowEditDialog(false)
                  setEditingParticipation(null)
                }
              }}
              disabled={!editingParticipation?.createur}
            >
              {editingParticipation?.id ? "Sauvegarder" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Marquer comme payé</DialogTitle>
            <DialogDescription>
              Participation de {payingParticipation?.createur} pour {payingParticipation?.mois}
            </DialogDescription>
          </DialogHeader>

          {payingParticipation && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Montant :</span>
                  <span className="text-xl font-bold text-green-600">
                    {payingParticipation.montantLoyer.toFixed(2)}€
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-paiement-participation">Date de paiement</Label>
                <Input
                  id="date-paiement-participation"
                  type="date"
                  value={paymentData.datePaiement}
                  onChange={(e) => setPaymentData({ ...paymentData, datePaiement: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode-paiement-participation">Mode de paiement</Label>
                <Select
                  value={paymentData.modePaiement}
                  onValueChange={(value) => setPaymentData({ ...paymentData, modePaiement: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Virement">Virement</SelectItem>
                    <SelectItem value="Espèces">Espèces</SelectItem>
                    <SelectItem value="Chèque">Chèque</SelectItem>
                    <SelectItem value="Carte bancaire">Carte bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference-paiement">Référence</Label>
                <Input
                  id="reference-paiement"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  placeholder="Référence du paiement"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleConfirmPayment} disabled={!paymentData.datePaiement || !paymentData.modePaiement}>
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
