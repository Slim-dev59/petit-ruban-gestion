"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { CreditCard, DollarSign, CheckCircle, Edit, Trash2, Download, Calendar } from "lucide-react"
import { useStore } from "@/lib/store"

export function PaymentManagement() {
  const { creators, monthlyData, payCreatorAndReset, getAllPayments, updatePayment, deletePayment, currentMonth } =
    useStore()
  const [selectedCreator, setSelectedCreator] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [dateRange, setDateRange] = useState<"month" | "custom">("month")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<any>(null)
  const [paymentData, setPaymentData] = useState({
    dateVirement: new Date().toISOString().split("T")[0],
    reference: "",
    banque: "",
    notes: "",
    creePar: "Admin",
  })

  const availableMonths = Object.keys(monthlyData).sort().reverse()

  // Fonction pour obtenir les paiements selon la période sélectionnée
  const getPaymentsForPeriod = () => {
    if (dateRange === "month") {
      const monthData = monthlyData[selectedMonth]
      return monthData ? monthData.payments : []
    } else {
      // Période personnalisée
      const startDate = new Date(customStartDate)
      const endDate = new Date(customEndDate)

      return getAllPayments().filter((payment) => {
        const paymentDate = new Date(payment.dateVirement)
        return paymentDate >= startDate && paymentDate <= endDate
      })
    }
  }

  // Obtenir les statistiques pour un créateur et un mois
  const getCreatorStats = (creator: string, month: string) => {
    const monthData = monthlyData[month]
    if (!monthData) return null

    const activeSales = monthData.salesData.filter((sale) => sale.createur === creator && sale.statut !== "payee")
    const paidSales = monthData.salesData.filter((sale) => sale.createur === creator && sale.statut === "payee")

    const activeRevenue = activeSales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
    const activeCommission = activeSales.reduce((sum, sale) => {
      const price = Number.parseFloat(sale.prix || "0")
      const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
      return sum + (isNotCash ? price * 0.0175 : 0) // 1.75%
    }, 0)

    return {
      activeSales: activeSales.length,
      paidSales: paidSales.length,
      activeRevenue,
      activeCommission,
      netToPay: activeRevenue - activeCommission,
    }
  }

  const handlePayment = () => {
    if (!selectedCreator || !selectedMonth) return

    payCreatorAndReset(selectedCreator, paymentData, selectedMonth)
    setShowPaymentDialog(false)
    setPaymentData({
      dateVirement: new Date().toISOString().split("T")[0],
      reference: "",
      banque: "",
      notes: "",
      creePar: "Admin",
    })
  }

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment)
    setShowEditDialog(true)
  }

  const handleUpdatePayment = () => {
    if (!editingPayment) return

    updatePayment(editingPayment.id, editingPayment)
    setShowEditDialog(false)
    setEditingPayment(null)
  }

  const handleDeletePayment = (paymentId: string) => {
    if (
      confirm("Êtes-vous sûr de vouloir supprimer ce paiement ? Les ventes associées seront remises en statut actif.")
    ) {
      deletePayment(paymentId)
    }
  }

  const exportPayments = () => {
    const payments = getPaymentsForPeriod()
    const csvContent = [
      "Date,Créateur,Montant,Référence,Banque,Ventes payées,Notes",
      ...payments.map((payment) =>
        [
          payment.dateVirement,
          payment.createur,
          payment.montant.toFixed(2),
          payment.reference,
          payment.banque,
          payment.ventesPayees.length,
          `"${payment.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    const filename =
      dateRange === "month" ? `paiements-${selectedMonth}.csv` : `paiements-${customStartDate}-${customEndDate}.csv`
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const selectedStats = selectedCreator && selectedMonth ? getCreatorStats(selectedCreator, selectedMonth) : null
  const paymentsForPeriod = getPaymentsForPeriod()

  const getPeriodLabel = () => {
    if (dateRange === "month") {
      return new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })
    } else {
      return `${customStartDate} - ${customEndDate}`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des paiements</h2>
          <p className="text-muted-foreground">Gérez les paiements aux créateurs et consultez l'historique</p>
        </div>
        <Button onClick={exportPayments} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Sélection de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Période d'affichage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={dateRange} onValueChange={(value: "month" | "custom") => setDateRange(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Par mois</SelectItem>
                <SelectItem value="custom">Période personnalisée</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "month" ? (
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
            ) : (
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-40"
                />
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nouveau paiement */}
      {dateRange === "month" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Nouveau paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {selectedStats && selectedStats.activeSales > 0 && (
                <div className="flex items-end">
                  <Button onClick={() => setShowPaymentDialog(true)} className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Effectuer le paiement ({selectedStats.netToPay.toFixed(2)}€)
                  </Button>
                </div>
              )}
            </div>

            {selectedStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">Ventes actives</div>
                  <div className="text-xl font-bold text-blue-700">{selectedStats.activeSales}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">CA à payer</div>
                  <div className="text-xl font-bold text-green-700">{selectedStats.activeRevenue.toFixed(2)}€</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="text-sm text-red-600">Commission</div>
                  <div className="text-xl font-bold text-red-700">-{selectedStats.activeCommission.toFixed(2)}€</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600">Net à verser</div>
                  <div className="text-xl font-bold text-purple-700">{selectedStats.netToPay.toFixed(2)}€</div>
                </div>
              </div>
            )}

            {selectedStats && selectedStats.activeSales === 0 && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Aucune vente en attente de paiement pour ce créateur ce mois-ci.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Liste des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Historique des paiements - {getPeriodLabel()}
          </CardTitle>
          <CardDescription>
            {paymentsForPeriod.length} paiement{paymentsForPeriod.length > 1 ? "s" : ""} trouvé
            {paymentsForPeriod.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsForPeriod.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun paiement pour cette période</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Ventes</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsForPeriod
                  .sort((a, b) => new Date(b.dateVirement).getTime() - new Date(a.dateVirement).getTime())
                  .map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{new Date(payment.dateVirement).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.createur}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.reference}</TableCell>
                      <TableCell>{payment.banque}</TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {payment.montant.toFixed(2)}€
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{payment.ventesPayees.length} ventes</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={payment.notes}>
                        {payment.notes}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPayment(payment)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-red-600 hover:text-red-700"
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

      {/* Dialog de nouveau paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Effectuer un paiement</DialogTitle>
            <DialogDescription>
              Paiement pour {selectedCreator} -{" "}
              {selectedMonth &&
                new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
            </DialogDescription>
          </DialogHeader>

          {selectedStats && (
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span>Montant net à verser :</span>
                <span className="text-xl font-bold text-green-600">{selectedStats.netToPay.toFixed(2)}€</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedStats.activeSales} ventes • CA: {selectedStats.activeRevenue.toFixed(2)}€ • Commission: -
                {selectedStats.activeCommission.toFixed(2)}€
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date-virement">Date de virement</Label>
              <Input
                id="date-virement"
                type="date"
                value={paymentData.dateVirement}
                onChange={(e) => setPaymentData({ ...paymentData, dateVirement: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Référence de virement</Label>
              <Input
                id="reference"
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                placeholder="REF-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banque">Banque</Label>
              <Input
                id="banque"
                value={paymentData.banque}
                onChange={(e) => setPaymentData({ ...paymentData, banque: e.target.value })}
                placeholder="Nom de la banque"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                placeholder="Notes sur le paiement..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!paymentData.dateVirement || !paymentData.reference || !paymentData.banque}
            >
              Confirmer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition de paiement */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le paiement</DialogTitle>
            <DialogDescription>Modifiez les informations de ce paiement</DialogDescription>
          </DialogHeader>

          {editingPayment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date-virement">Date de virement</Label>
                <Input
                  id="edit-date-virement"
                  type="date"
                  value={editingPayment.dateVirement}
                  onChange={(e) => setEditingPayment({ ...editingPayment, dateVirement: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-reference">Référence de virement</Label>
                <Input
                  id="edit-reference"
                  value={editingPayment.reference}
                  onChange={(e) => setEditingPayment({ ...editingPayment, reference: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-banque">Banque</Label>
                <Input
                  id="edit-banque"
                  value={editingPayment.banque}
                  onChange={(e) => setEditingPayment({ ...editingPayment, banque: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-montant">Montant (€)</Label>
                <Input
                  id="edit-montant"
                  type="number"
                  step="0.01"
                  value={editingPayment.montant}
                  onChange={(e) =>
                    setEditingPayment({ ...editingPayment, montant: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingPayment.notes || ""}
                  onChange={(e) => setEditingPayment({ ...editingPayment, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdatePayment}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
