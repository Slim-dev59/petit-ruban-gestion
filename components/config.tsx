"use client"

interface Config {
  clientId: string
  clientSecret: string
  baseUrl: string
  apiUrl: string
}

const config: Config = {
  clientId: process.env.NEXT_PUBLIC_SUMUP_CLIENT_ID || "",
  clientSecret: process.env.SUMUP_CLIENT_SECRET || "",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://gestion.petit-ruban.fr",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://gestion.petit-ruban.fr/api",
}

export default config
