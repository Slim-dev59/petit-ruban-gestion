"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useStore } from "@/lib/store"
import { getClientClient } from "@/lib/supabase/database"

export function DataMigration() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const { creators, stockData, getAllPayments, getAllParticipations } = useStore()

  const migrateData = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const supabase = getClientClient()
      console.log("[v0] Starting data migration...")

      if (creators.length > 0) {
        const creatorsData = creators.map((name) => ({
          name,
          email: null,
          phone: null,
        }))

        const { error: creatorsError } = await supabase.from("creators").insert(creatorsData)

        if (creatorsError) throw creatorsError
        console.log(`[v0] Migrated ${creators.length} creators`)
      }

      if (stockData.length > 0) {
        // Get creator IDs for mapping
        const { data: createdCreators } = await supabase.from("creators").select("id, name")

        const stockDataWithIds = stockData
          .map((item) => {
            const creator = createdCreators?.find((c) => c.name === item.createur)
            return {
              creator_id: creator?.id,
              article: item.article,
              price: Number.parseFloat(item.price),
              quantity: Number.parseInt(item.quantity),
              category: item.category,
              sku: item.sku,
              low_stock_threshold: Number.parseInt(item.lowStockThreshold),
              image_url: item.image,
            }
          })
          .filter((item) => item.creator_id)

        if (stockDataWithIds.length > 0) {
          const { error: stockError } = await supabase.from("stock_items").insert(stockDataWithIds)

          if (stockError) throw stockError
          console.log(`[v0] Migrated ${stockDataWithIds.length} stock items`)
        }
      }

      const payments = getAllPayments()
      if (payments.length > 0) {
        const { data: createdCreators } = await supabase.from("creators").select("id, name")

        const paymentsData = payments
          .map((payment) => {
            const creator = createdCreators?.find((c) => c.name === payment.createur)
            return {
              creator_id: creator?.id,
              amount: payment.montant,
              transfer_date: payment.dateVirement,
              reference: payment.reference,
              bank: payment.banque,
              notes: payment.notes,
              created_by: payment.creePar,
              month: payment.dateVirement?.substring(0, 7),
            }
          })
          .filter((p) => p.creator_id)

        if (paymentsData.length > 0) {
          const { error: paymentsError } = await supabase.from("payments").insert(paymentsData)

          if (paymentsError) throw paymentsError
          console.log(`[v0] Migrated ${paymentsData.length} payments`)
        }
      }

      const participations = getAllParticipations()
      if (participations.length > 0) {
        const { data: createdCreators } = await supabase.from("creators").select("id, name")

        const participationsData = participations
          .map((part) => {
            const creator = createdCreators?.find((c) => c.name === part.createur)
            return {
              creator_id: creator?.id,
              month: part.mois,
              amount: part.montantLoyer,
              due_date: part.dateEcheance,
              status: part.statut,
              payment_date: part.datePaiement,
              payment_method: part.modePaiement,
              reference: part.reference,
              notes: part.notes,
            }
          })
          .filter((p) => p.creator_id)

        if (participationsData.length > 0) {
          const { error: particError } = await supabase.from("participations").insert(participationsData)

          if (particError) throw particError
          console.log(`[v0] Migrated ${participationsData.length} participations`)
        }
      }

      setMessage({
        type: "success",
        text: "Données migrées avec succès vers Supabase !",
      })
    } catch (error) {
      console.error("[v0] Migration error:", error)
      setMessage({
        type: "error",
        text: `Erreur lors de la migration: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Migration des données</CardTitle>
        <CardDescription>Transférez vos données locales vers Supabase</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-2">Données à migrer:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>{creators.length} créateurs</li>
            <li>{stockData.length} articles en stock</li>
            <li>{getAllPayments().length} paiements</li>
            <li>{getAllParticipations().length} participations</li>
          </ul>
        </div>

        <Button onClick={migrateData} disabled={isLoading} className="w-full">
          {isLoading ? "Migration en cours..." : "Migrer vers Supabase"}
        </Button>
      </CardContent>
    </Card>
  )
}
