import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Token d'accès manquant" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("start_date") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const endDate = searchParams.get("end_date") || new Date().toISOString()

    // Récupérer les transactions depuis l'API SumUp
    const transactionsResponse = await fetch(
      `https://api.sumup.com/v0.1/me/transactions/history?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      },
    )

    if (!transactionsResponse.ok) {
      throw new Error("Erreur lors de la récupération des transactions")
    }

    const transactionsData = await transactionsResponse.json()

    // Transformer les données SumUp vers notre format
    const sales =
      transactionsData.items?.map((transaction: any) => ({
        id: transaction.id,
        date: transaction.timestamp,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status === "SUCCESSFUL" ? "completed" : "pending",
        paymentMethod: transaction.payment_type || "card",
        products: transaction.products || [],
        creator: "SumUp Import", // À mapper selon vos besoins
        createdAt: transaction.timestamp,
      })) || []

    return NextResponse.json({
      success: true,
      sales,
      count: sales.length,
      totalAmount: sales.reduce((sum: number, sale: any) => sum + (sale.amount || 0), 0),
    })
  } catch (error) {
    console.error("Erreur transactions SumUp:", error)
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des transactions" },
      { status: 500 },
    )
  }
}
