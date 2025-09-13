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

    // Appel à l'API SumUp pour récupérer les transactions
    const response = await fetch(`https://api.sumup.com/v0.1/me/transactions?${params}`, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des transactions")
    }

    const transactions = await response.json()

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Erreur API transactions:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des transactions" }, { status: 500 })
  }
}
