import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")

    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'autorisation manquant" }, { status: 401 })
    }

    const requestId = `transactions-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Récupérer les transactions du mois en cours
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const params = new URLSearchParams({
      limit: "100",
      since: startOfMonth.toISOString(),
      until: endOfMonth.toISOString(),
    })

    const response = await fetch(`https://api.sumup.com/v0.1/me/transactions/history?${params}`, {
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
      console.error("❌ Erreur SumUp transactions:", data)
      return NextResponse.json(
        {
          success: false,
          error: data.error_description || data.message || "Erreur lors de la récupération des transactions",
        },
        { status: response.status },
      )
    }

    console.log(`✅ ${data.length || 0} transactions SumUp récupérées`)
    return NextResponse.json({
      success: true,
      transactions: data || [],
    })
  } catch (error) {
    console.error("❌ Erreur serveur transactions:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur interne" }, { status: 500 })
  }
}
