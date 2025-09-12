// Script pour analyser le fichier de stock SumUp
const stockFileUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025-09-12_14-42-12_items-export_MDFC4ZGN-pRPqiBIk13QCtFjrYrSMwNfkwlEL6n.csv"

async function analyzeStockFile() {
  try {
    console.log("Récupération du fichier de stock SumUp...")
    const response = await fetch(stockFileUrl)
    const csvText = await response.text()

    console.log("Contenu du fichier (premiers 2000 caractères):")
    console.log(csvText.substring(0, 2000))

    // Parse CSV avec gestion des guillemets
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

    console.log("\n=== STRUCTURE DU FICHIER ===")
    headers.forEach((header, index) => {
      console.log(`Colonne ${index}: ${header}`)
    })

    // Analyser la logique créateur/article
    console.log("\n=== ANALYSE CRÉATEUR/ARTICLE ===")
    let currentCreator = ""
    let creatorCount = 0
    let articleCount = 0

    for (let i = 1; i <= Math.min(50, lines.length - 1); i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Parsing CSV amélioré
      const values = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const itemName = values[0] || ""
      const variations = values[1] || ""
      const price = values[11] || ""
      const quantity = values[19] || ""

      console.log(`Ligne ${i}: ItemName="${itemName}", Variations="${variations}", Prix="${price}", Qty="${quantity}"`)

      // Si on a un Item name mais pas de Variations, c'est un créateur
      if (itemName.trim() && !variations.trim()) {
        currentCreator = itemName.trim()
        creatorCount++
        console.log(`  -> CRÉATEUR: ${currentCreator}`)
      }
      // Si on a des Variations et un créateur actuel, c'est un article
      else if (variations.trim() && currentCreator) {
        articleCount++
        console.log(`  -> ARTICLE de ${currentCreator}: ${variations.trim()}`)
      }
    }

    console.log(`\nRésumé: ${creatorCount} créateurs, ${articleCount} articles détectés`)

    // Analyser les colonnes importantes
    console.log("\n=== COLONNES IMPORTANTES ===")
    console.log("Item name (créateur):", headers[0])
    console.log("Variations (article):", headers[1])
    console.log("Price:", headers[11])
    console.log("Quantity:", headers[19])
    console.log("SKU:", headers[21])
    console.log("Category:", headers[24])
    console.log("Low stock threshold:", headers[20])
    console.log("Image 1:", headers[26])
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error)
  }
}

analyzeStockFile()
