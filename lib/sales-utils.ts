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

  // Remplacer les virgules par des points pour le parsing
  const cleanPrice = priceString.toString().replace(",", ".")
  const parsed = Number.parseFloat(cleanPrice)

  return isNaN(parsed) ? 0 : parsed
}

export function calculateCommission(price: number, rate: number, paymentMethod: string): number {
  // Pas de commission sur les paiements en espèces
  if (
    paymentMethod?.toLowerCase().includes("espèce") ||
    paymentMethod?.toLowerCase().includes("cash") ||
    paymentMethod?.toLowerCase().includes("liquide")
  ) {
    return 0
  }

  return price * (rate / 100)
}

export function identifyCreatorFromText(text: string, creators: string[]): string {
  if (!text) return "Non identifié"

  const textLower = text.toLowerCase()
  const words = textLower.split(/\s+/).slice(0, 5) // Analyser les 5 premiers mots

  for (const creator of creators) {
    if (creator === "Non identifié") continue

    const creatorLower = creator.toLowerCase()
    const creatorWords = creatorLower.split(/\s+/)

    // Vérification exacte du nom complet
    if (textLower.includes(creatorLower)) {
      return creator
    }

    // Vérification par mots individuels
    const matchedWords = creatorWords.filter((word) =>
      words.some(
        (textWord) =>
          textWord.includes(word) || word.includes(textWord) || textWord.startsWith(word) || word.startsWith(textWord),
      ),
    )

    // Si tous les mots du créateur sont trouvés
    if (matchedWords.length === creatorWords.length && creatorWords.length > 0) {
      return creator
    }

    // Vérification par initiales pour les noms composés
    if (creatorWords.length > 1) {
      const initials = creatorWords.map((word) => word[0]).join("")
      if (words.some((word) => word.includes(initials))) {
        return creator
      }
    }
  }

  return "Non identifié"
}
