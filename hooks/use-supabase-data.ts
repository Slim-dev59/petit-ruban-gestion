"use client"

import { useEffect, useState } from "react"
import { getClientClient } from "@/lib/supabase/database"
import type { Creator, Sale, Payment, StockItem } from "@/lib/supabase/database"

export function useCreators() {
  const [creators, setCreators] = useState<Creator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const supabase = getClientClient()
        const { data, error } = await supabase.from("creators").select("*")
        if (error) throw error
        setCreators(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch creators")
      } finally {
        setLoading(false)
      }
    }

    fetchCreators()
  }, [])

  return { creators, loading, error }
}

export function useSales(month?: string, creator_id?: string) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const supabase = getClientClient()
        let query = supabase.from("sales").select("*")

        if (month) query = query.eq("month", month)
        if (creator_id) query = query.eq("creator_id", creator_id)

        const { data, error } = await query
        if (error) throw error
        setSales(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch sales")
      } finally {
        setLoading(false)
      }
    }

    fetchSales()
  }, [month, creator_id])

  return { sales, loading, error }
}

export function useStockItems(creator_id?: string) {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const supabase = getClientClient()
        let query = supabase.from("stock_items").select("*")

        if (creator_id) query = query.eq("creator_id", creator_id)

        const { data, error } = await query
        if (error) throw error
        setItems(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stock")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [creator_id])

  return { items, loading, error }
}

export function usePayments(creator_id?: string) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const supabase = getClientClient()
        let query = supabase.from("payments").select("*")

        if (creator_id) query = query.eq("creator_id", creator_id)

        const { data, error } = await query
        if (error) throw error
        setPayments(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch payments")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [creator_id])

  return { payments, loading, error }
}
