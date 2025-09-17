const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://gestion.petit-ruban.fr/api",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://gestion.petit-ruban.fr",
  sumup: {
    apiUrl: "https://api.sumup.com",
    authUrl: "https://api.sumup.com/authorize",
    tokenUrl: "https://api.sumup.com/token",
    scopes: "transactions.history payments user.app-settings user.profile_readonly",
  },
  app: {
    name: "Le Petit Ruban",
    description: "Gestion Multi-Créateurs",
    version: "1.0.0",
  },
}

export default config
