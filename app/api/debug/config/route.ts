// Debug endpoint to check configuration (remove in production)
import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    environment: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeVersion: process.version,
    deploymentTarget: process.env.VERCEL ? "Vercel" : "Local",
  }

  return NextResponse.json(config)
}
