import { getServerClient } from "@/lib/supabase/database"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getServerClient()

    // Check database connection
    const { error } = await supabase.from("creators").select("id").limit(1)

    if (error) {
      return NextResponse.json({ status: "unhealthy", database: "disconnected" }, { status: 503 })
    }

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ status: "unhealthy", error: String(error) }, { status: 503 })
  }
}
