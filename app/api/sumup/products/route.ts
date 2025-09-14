import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")

    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'autorisation manquant" }, { status: 401 })
    }

    const response = await fetch("https://api.sumup.com/v0.1/me/products", {
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.message || "Erreur lors de la récupération des produits" },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Transformer les données SumUp en format local
    const products = data.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      vat_rate: product.vat_rate,
      created_at: product.created_at,
      updated_at: product.updated_at,
    }))

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    })
  } catch (error) {
    console.error("Erreur API products:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
