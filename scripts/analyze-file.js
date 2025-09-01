// Script pour analyser le fichier d'export
const fileUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2025-08-05_09-18-01_items-export_MDFC4ZGN%20%281%29-LvFjeTa8HwIX36ydUSNfIS3A3coV5Z.csv"

async function analyzeFile() {
  try {
    console.log("Récupération du fichier...")
    const response = await fetch(fileUrl)
    const csvText = await response.text()

    console.log("Contenu du fichier (premiers 1000 caractères):")
    console.log(csvText.substring(0, 1000))

    // Parse CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

    console.log("\nEn-têtes du fichier:")
    headers.forEach((header, index) => {
      console.log(`${index}: ${header}`)
    })

    // Analyser quelques lignes de données
    console.log("\nPremières lignes de données:")
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
      console.log(`\nLigne ${i}:`)
      headers.forEach((header, index) => {
        if (values[index]) {
          console.log(`  ${header}: ${values[index]}`)
        }
      })
    }

    // Analyser les catégories pour identifier les créateurs
    const categories = new Set()
    const itemNames = new Set()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
      const categoryIndex = headers.indexOf("Category")
      const itemNameIndex = headers.indexOf("Item name")

      if (categoryIndex !== -1 && values[categoryIndex]) {
        categories.add(values[categoryIndex])
      }
      if (itemNameIndex !== -1 && values[itemNameIndex]) {
        itemNames.add(values[itemNameIndex])
      }
    }

    console.log("\nCatégories trouvées:")
    categories.forEach((cat) => console.log(`  - ${cat}`))

    console.log("\nQuelques noms d'articles:")
    Array.from(itemNames)
      .slice(0, 10)
      .forEach((name) => console.log(`  - ${name}`))
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error)
  }
}

analyzeFile()
