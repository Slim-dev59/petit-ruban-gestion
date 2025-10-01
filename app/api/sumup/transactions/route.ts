import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")
    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'accès manquant" })
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
        Authorization: authorization,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        transactions: data,
        period: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
      })
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || "Erreur lors de la récupération des transactions",
      })
    }
  } catch (error) {
    console.error("Erreur API transactions:", error)
    return NextResponse.json({
      success: false,
      error: "Erreur serveur lors de la récupération des transactions",
    })
  }
}
