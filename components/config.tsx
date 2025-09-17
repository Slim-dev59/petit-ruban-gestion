const config = {
  clientId: process.env.NEXT_PUBLIC_SUMUP_CLIENT_ID || "",
  clientSecret: process.env.SUMUP_CLIENT_SECRET || "",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  apiUrl: "https://api.sumup.com",
  authUrl: "https://api.sumup.com/authorize",
}

export default config
