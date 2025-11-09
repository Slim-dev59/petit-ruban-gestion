import { createClient } from "./supabase/server"

export async function getSupabaseClient() {
  return await createClient()
}

export type { Tables } from "@supabase/supabase-js"
