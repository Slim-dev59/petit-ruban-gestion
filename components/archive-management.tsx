"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Archive, DollarSign, CheckCircle, Clock, CreditCard, AlertCircle } from "lucide-react"
import { useStore } from "@/lib/store"

export function ArchiveManagement() {
  const { creators, monthlyData, payCreatorAndReset, getPaymentsForCreator, currentMonth } = useStore()
  const [selectedCreator, setSelectedCreator] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentData, setPaymentData] = useState({
    dateVirement: new Date().toISOString().split("T")[0],
    reference: "",
    banque: "",
    notes: "",
    creePar: "Admin",
  })

  const availableMonths = Object.keys(monthlyData).sort().reverse()

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
      payments: getPaymentsForCreator(creator, month),
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

  const selectedStats = selectedCreator && selectedMonth ? getCreatorStats(selectedCreator, selectedMonth) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des archives et paiements</h2>
        <p className="text-muted-foreground">Archivez les ventes et gérez les paiements aux créateurs</p>
      </div>

      {/* Sélection créateur et mois */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Sélection
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

            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
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

      {/* Statistiques du créateur sélectionné */}
      {selectedStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {selectedCreator} -{" "}
                {new Date(selectedMonth + "-01").toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
              </span>
              {selectedStats.activeSales > 0 && (
                <Button onClick={() => setShowPaymentDialog(true)} className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Effectuer le paiement
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Ventes actives</div>
                <div className="text-2xl font-bold text-blue-700">{selectedStats.activeSales}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">CA à payer</div>
                <div className="text-2xl font-bold text-green-700">{selectedStats.activeRevenue.toFixed(2)}€</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">Commission</div>
                <div className="text-2xl font-bold text-red-700">-{selectedStats.activeCommission.toFixed(2)}€</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Net à verser</div>
                <div className="text-2xl font-bold text-purple-700">{selectedStats.netToPay.toFixed(2)}€</div>
              </div>
            </div>

            {selectedStats.activeSales === 0 && selectedStats.paidSales === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Aucune vente trouvée pour ce créateur sur cette période.</AlertDescription>
              </Alert>
            )}

            {selectedStats.activeSales === 0 && selectedStats.paidSales > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Toutes les ventes de ce créateur ont été payées ({selectedStats.paidSales} ventes).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historique des paiements */}
      {selectedStats && selectedStats.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historique des paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date de virement</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Banque</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Ventes payées</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedStats.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.dateVirement).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="font-mono">{payment.reference}</TableCell>
                    <TableCell>{payment.banque}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{payment.montant.toFixed(2)}€</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.ventesPayees.length} ventes</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate" title={payment.notes}>
                      {payment.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog de paiement */}
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
    </div>
  )
}
