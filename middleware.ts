import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  // Vérifier si c'est une route API d'authentification
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Vérifier si c'est une route API protégée
  if (request.nextUrl.pathname.startsWith("/api")) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
