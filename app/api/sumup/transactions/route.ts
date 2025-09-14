import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization")

    if (!authorization) {
      return NextResponse.json({ success: false, error: "Token d'autorisation manquant" }, { status: 401 })
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, error: errorData.message || "Erreur lors de la récupération des transactions" },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Transformer les données SumUp en format local
    const transactions =
      data.items?.map((transaction: any) => ({
        id: transaction.id,
        transaction_code: transaction.transaction_code,
        amount: transaction.amount,
        currency: transaction.currency,
        timestamp: transaction.timestamp,
        status: transaction.status,
        payment_type: transaction.payment_type,
        product_summary: transaction.product_summary,
        merchant_code: transaction.merchant_code,
        vat_amount: transaction.vat_amount,
        tip_amount: transaction.tip_amount,
      })) || []

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
      period: {
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    console.error("Erreur API transactions:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
