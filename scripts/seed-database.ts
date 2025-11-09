// Script to seed initial data into Supabase
// Run: npx ts-node scripts/seed-database.ts

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log("🌱 Starting database seeding...")

  try {
    const creators = [
      { name: "Creator 1", email: "creator1@example.com" },
      { name: "Creator 2", email: "creator2@example.com" },
      { name: "Creator 3", email: "creator3@example.com" },
    ]

    const { data: createdCreators, error: creatorsError } = await supabase.from("creators").insert(creators).select()

    if (creatorsError) throw creatorsError
    console.log("✅ Created creators:", createdCreators?.length)

    const { error: settingsError } = await supabase.from("settings").insert([
      {
        key: "commissionRate",
        value: { rate: 1.75 },
      },
      {
        key: "shopName",
        value: { name: "Ma Boutique Multi-Créateurs" },
      },
      {
        key: "loyerMensuel",
        value: { amount: 50 },
      },
    ])

    if (settingsError) throw settingsError
    console.log("✅ Created default settings")

    console.log("🎉 Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
