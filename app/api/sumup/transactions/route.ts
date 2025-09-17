import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    const requestId = request.headers.get("x-request-id") || `transactions-${Date.now()}`

    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'autorisation manquant" }, { status: 401 })
    }

    const accessToken = authorization.replace("Bearer ", "")

    console.log("🔄 Récupération des transactions SumUp...")

    // Récupérer les transactions du mois en cours
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const params = new URLSearchParams({
      limit: "100",
      oldest: startOfMonth.toISOString(),
      newest: endOfMonth.toISOString(),
    })

    const response = await fetch(`https://api.sumup.com/v0.1/me/transactions/history?${params}`, {
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
      console.error("❌ Erreur API SumUp transactions:", data)
      return NextResponse.json(
        {
          success: false,
          error: data.error_description || data.message || "Erreur lors de la récupération des transactions",
        },
        { status: response.status },
      )
    }

    console.log("✅ Transactions SumUp récupérées:", data.length || 0)

    return NextResponse.json({
      success: true,
      transactions: data || [],
      count: data?.length || 0,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Erreur serveur transactions:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur interne" }, { status: 500 })
  }
}
