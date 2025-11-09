"use client"

import { useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useStore } from "@/lib/store"

export function useSupabaseSync() {
  const store = useStore()

  // Sync creators from Supabase
  const syncCreators = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("creators").select("*")

      if (error) {
        console.error("[v0] Erreur sync créateurs:", error)
        return
      }

      if (data) {
        data.forEach((creator) => {
          if (!store.creators.includes(creator.name)) {
            store.addCreator(creator.name)
          }
        })
      }
    } catch (err) {
      console.error("[v0] Erreur lors du sync créateurs:", err)
    }
  }, [store])

  // Sync sales from Supabase
  const syncSales = useCallback(
    async (month?: string) => {
      try {
        const supabase = createClient()
        const targetMonth = month || store.currentMonth

        let query = supabase.from("sales").select("*")

        if (targetMonth) {
          query = query.eq("month", targetMonth)
        }

        const { data, error } = await query

        if (error) {
          console.error("[v0] Erreur sync ventes:", error)
          return
        }

        if (data && data.length > 0) {
          const transformedSales = data.map((sale) => ({
            id: sale.id,
            date: sale.sale_date,
            description: sale.description || "",
            prix: sale.price?.toString() || "0",
            paiement: sale.payment_method || "",
            createur: "", // Will be filled from creators table
            quantity: sale.quantity?.toString() || "1",
            statut: sale.status || "active",
            commission: sale.commission?.toString(),
            paymentId: sale.payment_id,
          }))

          store.importSalesData(transformedSales, targetMonth)
        }
      } catch (err) {
        console.error("[v0] Erreur lors du sync ventes:", err)
      }
    },
    [store],
  )

  // Sync stock from Supabase
  const syncStock = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("stock_items").select("*, creators(name)")

      if (error) {
        console.error("[v0] Erreur sync stock:", error)
        return
      }

      if (data) {
        const transformedStock = data.map((item) => ({
          createur: item.creators?.name || "",
          article: item.article,
          price: item.price?.toString() || "0",
          quantity: item.quantity?.toString() || "0",
          category: item.category || "",
          sku: item.sku || "",
          lowStockThreshold: item.low_stock_threshold?.toString() || "0",
          image: item.image_url || "",
        }))

        store.importStockData(transformedStock)
      }
    } catch (err) {
      console.error("[v0] Erreur lors du sync stock:", err)
    }
  }, [store])

  // Initial sync on mount
  useEffect(() => {
    syncCreators()
    syncStock()
    syncSales()
  }, [syncCreators, syncStock, syncSales])

  return { syncCreators, syncSales, syncStock }
}
