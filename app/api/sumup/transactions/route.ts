import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Token d'accès manquant" }, { status: 401 })
    }

    const accessToken = authHeader.replace("Bearer ", "")

    // Paramètres pour récupérer les transactions du mois en cours
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const params = new URLSearchParams({
      limit: "100",
      order: "descending",
      from_date: startOfMonth.toISOString().split("T")[0],
      to_date: endOfMonth.toISOString().split("T")[0],
    })

    // Récupérer les transactions depuis l'API SumUp
    const transactionsResponse = await fetch(`https://api.sumup.com/v0.1/me/transactions/history?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "PetitRuban-Gestion/1.0",
        "X-Request-ID": request.headers.get("x-request-id") || `transactions-${Date.now()}`,
      },
    })

    if (!transactionsResponse.ok) {
      const errorData = await transactionsResponse.json().catch(() => ({}))
      console.error("Erreur API SumUp transactions:", errorData)

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || `Erreur API SumUp: ${transactionsResponse.status}`,
        },
        { status: transactionsResponse.status },
      )
    }

    const transactionsData = await transactionsResponse.json()

    return NextResponse.json({
      success: true,
      transactions: transactionsData.data || [],
      total: transactionsData.data?.length || 0,
      period: {
        from: startOfMonth.toISOString().split("T")[0],
        to: endOfMonth.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    console.error("Erreur serveur transactions:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur interne" }, { status: 500 })
  }
}
