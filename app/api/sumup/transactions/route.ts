import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Token d'autorisation manquant" }, { status: 401 })
    }

    // Récupérer les transactions des 30 derniers jours
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const params = new URLSearchParams({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      limit: "100",
    })

    const response = await fetch(`https://api.sumup.com/v0.1/me/transactions/history?${params}`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des transactions" },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur lors de la récupération des transactions" }, { status: 500 })
  }
}
