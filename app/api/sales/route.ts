import { getServerClient } from "@/lib/supabase/database"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const creator_id = searchParams.get("creator_id")

    const supabase = await getServerClient()
    let query = supabase.from("sales").select("*")

    if (month) query = query.eq("month", month)
    if (creator_id) query = query.eq("creator_id", creator_id)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await getServerClient()

    const { data, error } = await supabase.from("sales").insert([body]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 })
  }
}
