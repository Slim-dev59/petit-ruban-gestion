import { type NextRequest, NextResponse } from "next/server"
import { validateCredentials, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Login request received:", { username: body.username, password: "***" })

    const { username, password } = body

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ success: false, message: "Username and password required" }, { status: 400 })
    }

    const isValid = await validateCredentials(username, password)
    console.log("Credentials validation result:", isValid)

    if (isValid) {
      const user = { username, isAdmin: true }
      const token = generateToken(user)

      const response = NextResponse.json({ success: true, user })

      // Définir le cookie d'authentification
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 heures
        path: "/",
      })

      console.log("Login successful for user:", username)
      return response
    } else {
      console.log("Invalid credentials")
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
