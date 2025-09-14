import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 })
    }

    // En production, faire l'appel réel à l'API SumUp
    const response = await fetch("https://api.sumup.com/v0.1/me/products", {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des produits")
    }

    const products = await response.json()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur API SumUp products:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des produits" }, { status: 500 })
  }
}
