import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Token d'accès manquant" }, { status: 401 })
    }

    // Récupérer les produits depuis l'API SumUp
    const productsResponse = await fetch("https://api.sumup.com/v0.1/me/products", {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!productsResponse.ok) {
      throw new Error("Erreur lors de la récupération des produits")
    }

    const productsData = await productsResponse.json()

    // Transformer les données SumUp vers notre format
    const products = productsData.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category || "Non catégorisé",
      stock: product.stock || 0,
      creator: "SumUp Import", // À mapper selon vos besoins
      createdAt: new Date().toISOString(),
    }))

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    })
  } catch (error) {
    console.error("Erreur produits SumUp:", error)
    return NextResponse.json({ success: false, error: "Erreur lors de la récupération des produits" }, { status: 500 })
  }
}
