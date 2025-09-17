import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const requestId = request.headers.get("x-request-id") || `products-${Date.now()}`

    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'autorisation manquant" }, { status: 401 })
    }

    const accessToken = authorization.replace("Bearer ", "")

    console.log("🔄 Récupération des produits SumUp...")

    const response = await fetch("https://api.sumup.com/v0.1/me/products", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "Boutique-Multi-Createurs/1.0",
        "X-Request-ID": requestId,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("❌ Erreur API SumUp products:", data)
      return NextResponse.json(
        {
          success: false,
          error: data.error_description || data.message || "Erreur lors de la récupération des produits",
        },
        { status: response.status },
      )
    }

    console.log("✅ Produits SumUp récupérés:", data.length || 0)

    return NextResponse.json({
      success: true,
      products: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error("❌ Erreur serveur products:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur interne" }, { status: 500 })
  }
}
