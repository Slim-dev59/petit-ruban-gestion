import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  // Permettre l'accès aux routes d'authentification et aux fichiers statiques
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Pour la page d'accueil, laisser passer (la vérification se fait côté client)
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Pour les autres routes, vérifier l'authentification
  const token = request.cookies.get("auth-token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  const user = verifyToken(token)
  if (!user) {
    const response = NextResponse.redirect(new URL("/", request.url))
    response.cookies.set("auth-token", "", { maxAge: 0 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
