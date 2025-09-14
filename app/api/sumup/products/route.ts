import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Token d'autorisation manquant" }, { status: 401 })
    }

    const response = await fetch("https://api.sumup.com/v0.1/me/products", {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de la récupération des produits" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur lors de la récupération des produits" }, { status: 500 })
  }
}
