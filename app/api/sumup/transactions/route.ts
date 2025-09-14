import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Token manquant" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "100"
    const since = searchParams.get("since") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // En production, faire l'appel réel à l'API SumUp
    const response = await fetch(`https://api.sumup.com/v0.1/me/transactions/history?limit=${limit}&since=${since}`, {
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
    console.error("Erreur API SumUp transactions:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des transactions" }, { status: 500 })
  }
}
