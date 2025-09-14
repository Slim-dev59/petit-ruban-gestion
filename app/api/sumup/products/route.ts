import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'accès manquant" })
    }

    const response = await fetch("https://api.sumup.com/v0.1/me/products", {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        products: data,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Erreur lors de la récupération des produits",
      })
    }
  } catch (error) {
    console.error("Erreur API produits:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur serveur lors de la récupération des produits",
    })
  }
}
