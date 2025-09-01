// Script pour analyser le fichier de ventes et identifier les bonnes colonnes
const salesFileUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rapport-ventes-2025-08-04_2025-08-10-pq5YgZJaQJSSoTQ1ezbkaSFXDMULGk.csv"

async function analyzeSalesFile() {
  try {
    console.log("Récupération du fichier de ventes...")
    const response = await fetch(salesFileUrl)
    const csvText = await response.text()

    console.log("Contenu du fichier (premiers 1500 caractères):")
    console.log(csvText.substring(0, 1500))

    // Parse CSV
    const lines = csvText.split("\n")
    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())

    console.log("\n=== STRUCTURE DU FICHIER ===")
    headers.forEach((header, index) => {
      const letter = String.fromCharCode(65 + index) // A, B, C, etc.
      console.log(`Colonne ${letter} (index ${index}): ${header}`)
    })

    // Analyser les 5 premières lignes de données
    console.log("\n=== ÉCHANTILLON DE DONNÉES ===")
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
      console.log(`\n--- Ligne ${i} ---`)
      headers.forEach((header, index) => {
        const letter = String.fromCharCode(65 + index)
        if (values[index]) {
          console.log(`  ${letter}: ${header} = "${values[index]}"`)
        }
      })
    }

    // Identifier spécifiquement les colonnes importantes
    console.log("\n=== IDENTIFICATION DES COLONNES CLÉS ===")

    // Chercher la colonne Description
    const descriptionIndex = headers.findIndex((h) => h.toLowerCase().includes("description"))
    if (descriptionIndex !== -1) {
      const letter = String.fromCharCode(65 + descriptionIndex)
      console.log(
        `✓ Description trouvée en colonne ${letter} (index ${descriptionIndex}): "${headers[descriptionIndex]}"`,
      )
    }

    // Chercher la colonne Prix/Montant (colonne H = index 7)
    if (headers[7]) {
      console.log(`✓ Colonne H (index 7): "${headers[7]}"`)
    }

    // Montrer quelques valeurs de la colonne H
    console.log("\n=== VALEURS COLONNE H (Prix) ===")
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
      if (values[7]) {
        console.log(`Ligne ${i}, Colonne H: "${values[7]}"`)
      }
    }

    // Montrer quelques valeurs de la colonne Description
    if (descriptionIndex !== -1) {
      console.log(`\n=== VALEURS COLONNE DESCRIPTION (${String.fromCharCode(65 + descriptionIndex)}) ===`)
      for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
        const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
        if (values[descriptionIndex]) {
          console.log(`Ligne ${i}: "${values[descriptionIndex]}"`)
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error)
  }
}

analyzeSalesFile()
