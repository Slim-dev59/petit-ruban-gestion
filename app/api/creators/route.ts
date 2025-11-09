import { getServerClient } from "@/lib/supabase/database"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await getServerClient()
    const { data, error } = await supabase.from("creators").select("*")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch creators" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = await getServerClient()

    const { data, error } = await supabase.from("creators").insert([body]).select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Failed to create creator" }, { status: 500 })
  }
}
