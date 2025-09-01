import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    const user = verifyToken(token)

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
