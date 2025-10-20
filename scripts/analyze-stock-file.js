// Script pour analyser le fichier CSV d'export SumUp
const fileUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025-10-04_10-50-16_items-export_MDFC4ZGN%20%281%29-TeUOZfsNCdHP8o5LVhDMK5ZVT5ygS8.csv"

async function analyzeCSV() {
  try {
    console.log("🔍 Récupération du fichier CSV...")
    const response = await fetch(fileUrl)
    const text = await response.text()

    console.log("\n📄 Premières 1000 caractères du fichier:")
    console.log(text.substring(0, 1000))
    console.log("\n" + "=".repeat(80))

    // Parser le CSV
    const lines = text.split("\n")
    console.log(`\n📊 Nombre total de lignes: ${lines.length}`)

    // Analyser les headers
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    console.log("\n📋 Headers détectés:")
    headers.forEach((h, i) => console.log(`  ${i + 1}. "${h}"`))

    // Analyser les 20 premières lignes de données
    console.log("\n🔍 Analyse des 20 premières lignes:")
    console.log("=".repeat(80))

    for (let i = 1; i <= Math.min(20, lines.length - 1); i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Parser la ligne
      const values = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""))
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""))

      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })

      console.log(`\n📄 Ligne ${i}:`)
      console.log(`  Item name: "${row["Item name"] || ""}"`)
      console.log(`  Variations: "${row["Variations"] || ""}"`)
      console.log(`  Price: "${row["Price"] || ""}"`)
      console.log(`  Quantity: "${row["Quantity"] || ""}"`)
      console.log(`  Category: "${row["Category"] || ""}"`)
      console.log(`  SKU: "${row["SKU"] || ""}"`)
    }

    // Détecter le pattern créateur/article
    console.log("\n\n🎯 Détection du pattern créateur/article:")
    console.log("=".repeat(80))

    let currentCreator = null
    let creatorsCount = 0
    let articlesCount = 0

    for (let i = 1; i < Math.min(50, lines.length); i++) {
      const line = lines[i]
      if (!line.trim()) continue

      const values = []
      let current = ""
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ""))
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ""))

      const itemNameIndex = headers.indexOf("Item name")
      const variationsIndex = headers.indexOf("Variations")

      const itemName = values[itemNameIndex] || ""
      const variations = values[variationsIndex] || ""

      if (itemName && !variations) {
        currentCreator = itemName
        creatorsCount++
        console.log(`\n👤 Créateur ${creatorsCount}: "${currentCreator}"`)
      } else if (variations && currentCreator) {
        articlesCount++
        console.log(`  ✅ Article: "${variations}" (Créateur: ${currentCreator})`)
      } else if (variations && !currentCreator) {
        console.log(`  ⚠️  Article sans créateur: "${variations}"`)
      }
    }

    console.log(`\n\n📈 Résumé:`)
    console.log(`  Créateurs détectés: ${creatorsCount}`)
    console.log(`  Articles détectés: ${articlesCount}`)
  } catch (error) {
    console.error("❌ Erreur:", error)
  }
}

analyzeCSV()
