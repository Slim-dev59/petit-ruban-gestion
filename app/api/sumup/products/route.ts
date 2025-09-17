import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Token d'accès manquant" }, { status: 401 })
    }

    const accessToken = authHeader.replace("Bearer ", "")

    // Récupérer les produits depuis l'API SumUp
    const productsResponse = await fetch("https://api.sumup.com/v0.1/me/catalog/products", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "PetitRuban-Gestion/1.0",
        "X-Request-ID": request.headers.get("x-request-id") || `products-${Date.now()}`,
      },
    })

    if (!productsResponse.ok) {
      const errorData = await productsResponse.json().catch(() => ({}))
      console.error("Erreur API SumUp products:", errorData)

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || `Erreur API SumUp: ${productsResponse.status}`,
        },
        { status: productsResponse.status },
      )
    }

    const productsData = await productsResponse.json()

    return NextResponse.json({
      success: true,
      products: productsData.data || [],
      total: productsData.data?.length || 0,
    })
  } catch (error) {
    console.error("Erreur serveur products:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur interne" }, { status: 500 })
  }
}
