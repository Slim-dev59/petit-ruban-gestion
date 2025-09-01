import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    console.log("Checking auth with token:", token ? "present" : "missing")

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const user = verifyToken(token)
    console.log("Token verification result:", user ? "valid" : "invalid")

    if (user) {
      return NextResponse.json({ authenticated: true, user })
    } else {
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}
