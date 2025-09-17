import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")

    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'autorisation manquant" }, { status: 401 })
    }

    const requestId = `products-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const response = await fetch("https://api.sumup.com/v0.1/me/products", {
      method: "GET",
      headers: {
        Authorization: authorization,
        Accept: "application/json",
        "User-Agent": "Boutique-Multi-Createurs/1.0",
        "X-Request-ID": requestId,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("❌ Erreur SumUp products:", data)
      return NextResponse.json(
        {
          success: false,
          error: data.error_description || data.message || "Erreur lors de la récupération des produits",
        },
        { status: response.status },
      )
    }

    console.log(`✅ ${data.length || 0} produits SumUp récupérés`)
    return NextResponse.json({
      success: true,
      products: data || [],
    })
  } catch (error) {
    console.error("❌ Erreur serveur products:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur interne" }, { status: 500 })
  }
}
