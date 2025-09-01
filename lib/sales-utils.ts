import type { Creator } from "./store"

export function identifyCreatorFromDescription(description: string, creators: Creator[]): Creator | null {
  const desc = description.toLowerCase()
  const words = desc.split(" ").slice(0, 4) // Analyser les 4 premiers mots

  for (const creator of creators) {
    const creatorName = creator.name.toLowerCase()
    const creatorWords = creatorName.split(" ")

    // Vérification exacte du nom complet
    if (words.join(" ").includes(creatorName)) {
      return creator
    }

    // Vérification par mots individuels
    const matchedWords = creatorWords.filter((word) =>
      words.some((descWord) => descWord.includes(word) || word.includes(descWord)),
    )

    if (matchedWords.length === creatorWords.length) {
      return creator
    }

    // Vérification par initiales si le créateur a plusieurs mots
    if (creatorWords.length > 1) {
      const initials = creatorWords.map((word) => word[0]).join("")
      if (words.some((word) => word.includes(initials))) {
        return creator
      }
    }
  }

  return null
}

export function exportToCSV(data: any[], filename: string) {
  const csvContent = [
    Object.keys(data[0]).join(","),
    ...data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
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
}

export function calculateCommission(price: number, commissionRate: number): number {
  return (price * commissionRate) / 100
}

export function formatCurrency(amount: number, currency = "€"): string {
  return `${amount.toFixed(2)}${currency}`
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR")
}
