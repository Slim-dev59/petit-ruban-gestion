// Initialize database on app startup
import { getServerClient } from "./supabase/database"

export async function initializeDatabase() {
  try {
    const supabase = await getServerClient()

    const { count, error } = await supabase.from("creators").select("*", { count: "exact", head: true })

    if (error) {
      console.error("[DB] Connection error:", error)
      return false
    }

    console.log(`[DB] ✅ Connected to Supabase (${count} creators)`)
    return true
  } catch (error) {
    console.error("[DB] Initialization failed:", error)
    return false
  }
}
