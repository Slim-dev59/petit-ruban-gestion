import { useStore } from "@/lib/store"

export const getSalesForCreator = (creator: string, month?: string) => {
  const { monthlyData, currentMonth } = useStore.getState()
  const targetMonth = month || currentMonth
  const monthData = monthlyData[targetMonth]
  if (!monthData) return []
  return monthData.salesData.filter((sale) => sale.createur === creator && sale.statut !== "payee")
}

export function exportToCSV(data: any[], filename: string) {
  const csvContent = [
    Object.keys(data[0]).join(","),
    ...data.map((row) =>
      Object.values(row)
        .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : value))
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString("fr-FR")
}

export function parsePrice(priceString: string): number {
  if (!priceString) return 0

  const cleanPrice = priceString.toString().replace(",", ".")
  const parsed = Number.parseFloat(cleanPrice)

  return isNaN(parsed) ? 0 : parsed
}

export function calculateCommission(price: number, rate: number, paymentMethod: string): number {
  if (
    paymentMethod?.toLowerCase().includes("espèce") ||
    paymentMethod?.toLowerCase().includes("cash") ||
    paymentMethod?.toLowerCase().includes("liquide")
  ) {
    return 0
  }

  return price * (rate / 100)
}

export function identifyCreatorFromStock(
  description: string,
  stockData: any[],
): { creator: string; confidence: number; matchedItem?: string } {
  const descLower = description.toLowerCase().trim()

  for (const item of stockData) {
    const itemNameLower = item.article.toLowerCase().trim()

    if (descLower === itemNameLower) {
      return { creator: item.createur, confidence: 1.0, matchedItem: item.article }
    }

    if (descLower.includes(itemNameLower) || itemNameLower.includes(descLower)) {
      return { creator: item.createur, confidence: 0.8, matchedItem: item.article }
    }
  }

  return { creator: "Non identifié", confidence: 0 }
}
