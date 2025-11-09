import { createClient as createServerClient } from "@supabase/ssr"
import { createBrowserClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// Types for database
export type Creator = {
  id: string
  name: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export type Sale = {
  id: string
  creator_id: string
  sale_date: string
  description?: string
  price: number
  payment_method?: string
  quantity: number
  status: "active" | "payee"
  commission?: number
  month: string
  payment_id?: string
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  creator_id: string
  amount: number
  transfer_date: string
  reference?: string
  bank?: string
  notes?: string
  created_by?: string
  month?: string
  created_at: string
  updated_at: string
}

export type Participation = {
  id: string
  creator_id: string
  month: string
  amount: number
  due_date: string
  status: "en_attente" | "paye" | "en_retard"
  payment_date?: string
  payment_method?: string
  reference?: string
  notes?: string
  created_at: string
  updated_at: string
}

export type StockItem = {
  id: string
  creator_id: string
  article: string
  price: number
  quantity: number
  category?: string
  sku: string
  low_stock_threshold: number
  image_url?: string
  created_at: string
  updated_at: string
}

export async function getServerClient() {
  const cookieStore = await cookies()

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_GPR_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_GPR_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignored: setAll is called from Server Component
        }
      },
    },
  })
}

export function getClientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_GPR_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_GPR_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
