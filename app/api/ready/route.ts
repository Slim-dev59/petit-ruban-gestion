// Vercel deployment readiness check
import { getServerClient } from "@/lib/supabase/database"
import { DATABASE_TABLES } from "@/lib/constants"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getServerClient()
    const checks = {
      database_connection: false,
      tables_exist: [] as string[],
      timestamp: new Date().toISOString(),
    }

    // Check database connection
    const { error: connError } = await supabase.from("creators").select("id").limit(1)

    if (!connError) {
      checks.database_connection = true

      // Check all required tables
      for (const table of DATABASE_TABLES) {
        try {
          const { error } = await supabase.from(table).select("id").limit(1)

          if (!error) {
            checks.tables_exist.push(table)
          }
        } catch {
          // Table check failed
        }
      }
    }

    const allReady = checks.database_connection && checks.tables_exist.length === DATABASE_TABLES.length

    return NextResponse.json({ ...checks, ready: allReady }, { status: allReady ? 200 : 503 })
  } catch (error) {
    return NextResponse.json({ ready: false, error: String(error) }, { status: 503 })
  }
}
