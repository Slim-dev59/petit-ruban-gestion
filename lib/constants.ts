export const DEPLOYMENT_STATUS = {
  HEALTH_CHECK_URL: "/api/health",
  MAX_RETRIES: 3,
  TIMEOUT_MS: 5000,
}

export const DATABASE_TABLES = [
  "creators",
  "stock_items",
  "sales",
  "payments",
  "participations",
  "settings",
  "import_history",
] as const

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 1000,
}
