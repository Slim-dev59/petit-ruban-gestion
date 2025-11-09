import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Test connection
    const { data: creators, error } = await supabase.from("creators").select("*").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: error.message,
          hint: error.hint,
          details: error.details,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Supabase connection successful",
      creators_count: creators?.length || 0,
      env_check: {
        has_url: !!(process.env.SUPABASE_URL || process.env.SUPABASE_GPR_SUPABASE_URL),
        has_key: !!(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_GPR_SUPABASE_ANON_KEY),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
