// Script pour analyser le nouveau fichier de ventes SumUp
const salesFileUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rapport-ventes-2025-06-21_2025-09-12-uLgt2l5BApmQh0ud9qww4yEAjPUMSs.csv"

async function analyzeSalesFile() {
  try {
    console.log("Récupération du fichier de ventes SumUp...")
    const response = await fetch(salesFileUrl)
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

    // Analyser les 10 premières lignes de données
    console.log("\n=== ÉCHANTILLON DE DONNÉES ===")
    for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
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

      console.log(`\n--- Ligne ${i} ---`)
      headers.forEach((header, index) => {
        if (values[index]) {
          console.log(`  ${header}: "${values[index]}"`)
        }
      })
    }

    // Analyser les types de transactions
    console.log("\n=== ANALYSE DES TYPES ===")
    const types = new Set()
    const paymentMethods = new Set()
    const sampleDescriptions = []

    for (let i = 1; i <= Math.min(50, lines.length - 1); i++) {
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
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const type = values[1] || ""
      const paymentMethod = values[3] || ""
      const description = values[5] || ""

      if (type) types.add(type)
      if (paymentMethod) paymentMethods.add(paymentMethod)
      if (description && sampleDescriptions.length < 10) {
        sampleDescriptions.push(description)
      }
    }

    console.log("Types de transactions:", Array.from(types))
    console.log("Moyens de paiement:", Array.from(paymentMethods))
    console.log("Échantillon descriptions:", sampleDescriptions)

    // Analyser les dates
    console.log("\n=== ANALYSE DES DATES ===")
    const dates = []
    for (let i = 1; i <= Math.min(20, lines.length - 1); i++) {
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
          values.push(current.trim())
          current = ""
        } else {
          current += char
        }
      }
      values.push(current.trim())

      const dateStr = values[0] || ""
      if (dateStr) {
        dates.push(dateStr)
      }
    }

    console.log("Échantillon de dates:", dates.slice(0, 5))

    // Test de parsing de date
    const testDate = dates[0]
    if (testDate) {
      console.log(`\nTest parsing date: "${testDate}"`)
      try {
        const months = {
          janv: "01",
          févr: "02",
          mars: "03",
          avr: "04",
          mai: "05",
          juin: "06",
          juil: "07",
          août: "08",
          sept: "09",
          oct: "10",
          nov: "11",
          déc: "12",
        }

        const parts = testDate.split(" ")
        const day = parts[0].padStart(2, "0")
        const monthName = parts[1].replace(".", "")
        const year = parts[2]
        const time = parts[3] || "00:00"

        const monthNum = months[monthName]
        const isoDate = `${year}-${monthNum}-${day}T${time}:00`
        const parsedDate = new Date(isoDate)
        const month = `${year}-${monthNum}`

        console.log(`Résultat: ${parsedDate.toISOString()} -> Mois: ${month}`)
      } catch (error) {
        console.log("Erreur parsing:", error.message)
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error)
  }
}

analyzeSalesFile()
