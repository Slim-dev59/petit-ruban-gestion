"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Trash2,
  Plus,
  User,
  CreditCard,
  Send,
  CheckCircle,
  History,
  Euro,
  Eye,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useStore } from "@/lib/store"

export function CreatorManagement() {
  const [newCreator, setNewCreator] = useState("")
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState("")
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set())
  const [paymentData, setPaymentData] = useState({
    dateVirement: "",
    reference: "",
    banque: "",
    notes: "",
  })

  const {
    creators,
    addCreator,
    removeCreator,
    getSalesForCreator,
    getAllSalesForCreator,
    getPaidSalesForCreator,
    getStockForCreator,
    payCreatorAndReset,
    getPaymentsForCreator,
    settings,
  } = useStore()

  const handleAddCreator = () => {
    if (newCreator.trim()) {
      addCreator(newCreator.trim())
      setNewCreator("")
    }
  }

  const handlePayCreator = () => {
    if (!selectedCreator || !paymentData.dateVirement || !paymentData.reference) return

    payCreatorAndReset(selectedCreator, {
      ...paymentData,
      creePar: "Administrateur",
    })

    setShowPaymentDialog(false)
    setSelectedCreator("")
    setPaymentData({
      dateVirement: "",
      reference: "",
      banque: "",
      notes: "",
    })
  }

  const openPaymentDialog = (creator: string) => {
    setSelectedCreator(creator)
    setPaymentData({
      ...paymentData,
      dateVirement: new Date().toISOString().split("T")[0],
    })
    setShowPaymentDialog(true)
  }

  const togglePaymentExpansion = (paymentId: string) => {
    const newExpanded = new Set(expandedPayments)
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId)
    } else {
      newExpanded.add(paymentId)
    }
    setExpandedPayments(newExpanded)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="creators" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="creators">Gestion des créateurs</TabsTrigger>
          <TabsTrigger value="payments">Historique des paiements</TabsTrigger>
        </TabsList>

        <TabsContent value="creators" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ajouter un créateur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Nom du créateur"
                  value={newCreator}
                  onChange={(e) => setNewCreator(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddCreator()}
                />
                <Button onClick={handleAddCreator}>Ajouter</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => {
              const sales = getSalesForCreator(creator)
              const allSales = getAllSalesForCreator(creator)
              const paidSales = getPaidSalesForCreator(creator)
              const stock = getStockForCreator(creator)
              const payments = getPaymentsForCreator(creator)

              const totalSales = sales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
              const totalCommission = sales.reduce((sum, sale) => {
                const price = Number.parseFloat(sale.prix || "0")
                const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
              }, 0)
              const netAmount = totalSales - totalCommission

              const totalPaid = payments.reduce((sum, payment) => sum + payment.montant, 0)

              return (
                <Card key={creator}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-4 w-4" />
                        {creator}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => removeCreator(creator)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ventes actives</p>
                        <p className="font-medium">{sales.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Articles</p>
                        <p className="font-medium">{stock.length}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total historique</p>
                        <p className="font-medium text-blue-600">{allSales.length} ventes</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Ventes payées</p>
                        <p className="font-medium text-green-600">{paidSales.length}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">CA en attente:</span>
                        <span className="font-medium">{totalSales.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Commission:</span>
                        <span className="font-medium text-red-600">-{totalCommission.toFixed(2)}€</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium border-t pt-2">
                        <span>À verser:</span>
                        <span className="text-green-600">{netAmount.toFixed(2)}€</span>
                      </div>
                      {totalPaid > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total payé:</span>
                          <span className="font-medium text-blue-600">{totalPaid.toFixed(2)}€</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      <Badge variant="secondary">{sales.length} actives</Badge>
                      <Badge variant="outline">{stock.length} articles</Badge>
                      {paidSales.length > 0 && (
                        <Badge variant="default" className="bg-green-600">
                          {paidSales.length} payées
                        </Badge>
                      )}
                      {payments.length > 0 && (
                        <Badge variant="default" className="bg-blue-600">
                          {payments.length} paiement(s)
                        </Badge>
                      )}
                    </div>

                    {netAmount > 0 && (
                      <Button onClick={() => openPaymentDialog(creator)} className="w-full" size="sm">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Payer et archiver ({sales.length} ventes)
                      </Button>
                    )}

                    {netAmount === 0 && sales.length === 0 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Aucune vente en attente
                          {paidSales.length > 0 && ` • ${paidSales.length} ventes archivées`}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {creators.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun créateur ajouté</p>
                <p className="text-sm text-muted-foreground">Commencez par ajouter des créateurs ci-dessus</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique des paiements
              </CardTitle>
              <CardDescription>Cliquez sur un paiement pour voir le détail des ventes concernées</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const allPayments = creators.flatMap((creator) => getPaymentsForCreator(creator))

                if (allPayments.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun paiement effectué</p>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4">
                    {allPayments
                      .sort((a, b) => new Date(b.dateVirement).getTime() - new Date(a.dateVirement).getTime())
                      .map((payment) => {
                        const isExpanded = expandedPayments.has(payment.id)
                        const totalCA = payment.ventesPayees.reduce(
                          (sum, sale) => sum + Number.parseFloat(sale.prix || "0"),
                          0,
                        )
                        const totalCommission = payment.ventesPayees.reduce((sum, sale) => {
                          const price = Number.parseFloat(sale.prix || "0")
                          const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                          return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
                        }, 0)

                        return (
                          <Card key={payment.id} className="overflow-hidden">
                            <Collapsible>
                              <CollapsibleTrigger asChild>
                                <CardHeader
                                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                                  onClick={() => togglePaymentExpansion(payment.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                      <div>
                                        <CardTitle className="text-lg">
                                          {payment.createur} - {payment.montant.toFixed(2)}€
                                        </CardTitle>
                                        <CardDescription>
                                          {new Date(payment.dateVirement).toLocaleDateString("fr-FR")} • Réf:{" "}
                                          {payment.reference} •{payment.ventesPayees.length} vente(s)
                                        </CardDescription>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="default" className="bg-green-600">
                                        <CreditCard className="h-3 w-3 mr-1" />
                                        Payé
                                      </Badge>
                                      <Badge variant="outline">
                                        <Eye className="h-3 w-3 mr-1" />
                                        {payment.ventesPayees.length} ventes
                                      </Badge>
                                    </div>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <CardContent className="pt-0">
                                  <div className="space-y-4">
                                    {/* Résumé financier */}
                                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                      <div className="text-center">
                                        <div className="text-sm text-muted-foreground">CA Total</div>
                                        <div className="font-semibold">{totalCA.toFixed(2)}€</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Commission</div>
                                        <div className="font-semibold text-red-600">-{totalCommission.toFixed(2)}€</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Net versé</div>
                                        <div className="font-semibold text-green-600">
                                          {payment.montant.toFixed(2)}€
                                        </div>
                                      </div>
                                    </div>

                                    {/* Informations du paiement */}
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Banque:</span>
                                        <span className="ml-2 font-medium">{payment.banque || "Non renseigné"}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Créé par:</span>
                                        <span className="ml-2 font-medium">{payment.creePar}</span>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Date création:</span>
                                        <span className="ml-2 font-medium">
                                          {new Date(payment.dateCreation).toLocaleDateString("fr-FR")}
                                        </span>
                                      </div>
                                      {payment.notes && (
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground">Notes:</span>
                                          <span className="ml-2 font-medium">{payment.notes}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Détail des ventes */}
                                    <div>
                                      <h4 className="font-medium mb-3 flex items-center gap-2">
                                        <Eye className="h-4 w-4" />
                                        Détail des ventes payées ({payment.ventesPayees.length})
                                      </h4>
                                      <div className="border rounded-lg overflow-hidden">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Date</TableHead>
                                              <TableHead>Description</TableHead>
                                              <TableHead>Prix</TableHead>
                                              <TableHead>Paiement</TableHead>
                                              <TableHead>Commission</TableHead>
                                              <TableHead>Net</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {payment.ventesPayees.map((sale, index) => {
                                              const price = Number.parseFloat(sale.prix || "0")
                                              const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                                              const commission = isNotCash ? price * (settings.commissionRate / 100) : 0
                                              const net = price - commission

                                              return (
                                                <TableRow key={index}>
                                                  <TableCell className="text-sm">
                                                    {new Date(sale.date).toLocaleDateString("fr-FR")}
                                                  </TableCell>
                                                  <TableCell
                                                    className="text-sm max-w-xs truncate"
                                                    title={sale.description}
                                                  >
                                                    {sale.description}
                                                  </TableCell>
                                                  <TableCell className="text-sm font-medium">
                                                    {price.toFixed(2)}€
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge
                                                      variant={isNotCash ? "secondary" : "outline"}
                                                      className="text-xs"
                                                    >
                                                      {sale.paiement}
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell className="text-sm text-red-600">
                                                    {commission > 0 ? `${commission.toFixed(2)}€` : "-"}
                                                  </TableCell>
                                                  <TableCell className="text-sm font-medium text-green-600">
                                                    {net.toFixed(2)}€
                                                  </TableCell>
                                                </TableRow>
                                              )
                                            })}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Collapsible>
                          </Card>
                        )
                      })}
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          {/* Statistiques des paiements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Total payé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {creators
                    .flatMap((creator) => getPaymentsForCreator(creator))
                    .reduce((sum, payment) => sum + payment.montant, 0)
                    .toFixed(2)}
                  €
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Paiements effectués
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {creators.flatMap((creator) => getPaymentsForCreator(creator)).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Créateurs payés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(creators.flatMap((creator) => getPaymentsForCreator(creator)).map((p) => p.createur)).size}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour effectuer un paiement */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payer le créateur</DialogTitle>
            <DialogDescription>
              Enregistrez le paiement pour {selectedCreator}. Cela archivera toutes ses ventes actuelles sous ce
              paiement et remettra son compteur à zéro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedCreator && (
              <Alert>
                <Euro className="h-4 w-4" />
                <AlertDescription>
                  <strong>Montant à verser :</strong> {(() => {
                    const sales = getSalesForCreator(selectedCreator)
                    const totalSales = sales.reduce((sum, sale) => sum + Number.parseFloat(sale.prix || "0"), 0)
                    const totalCommission = sales.reduce((sum, sale) => {
                      const price = Number.parseFloat(sale.prix || "0")
                      const isNotCash = sale.paiement?.toLowerCase() !== "espèces"
                      return sum + (isNotCash ? price * (settings.commissionRate / 100) : 0)
                    }, 0)
                    return (totalSales - totalCommission).toFixed(2)
                  })()}€ pour {getSalesForCreator(selectedCreator).length} vente(s) qui seront archivées
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Date du virement</Label>
              <Input
                type="date"
                value={paymentData.dateVirement}
                onChange={(e) => setPaymentData({ ...paymentData, dateVirement: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Référence du virement</Label>
              <Input
                value={paymentData.reference}
                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                placeholder="Ex: VIR123456789"
              />
            </div>

            <div className="space-y-2">
              <Label>Banque</Label>
              <Input
                value={paymentData.banque}
                onChange={(e) => setPaymentData({ ...paymentData, banque: e.target.value })}
                placeholder="Ex: Crédit Agricole"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                placeholder="Notes additionnelles..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handlePayCreator} disabled={!paymentData.dateVirement || !paymentData.reference}>
              <Send className="h-4 w-4 mr-2" />
              Effectuer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
