// Authentification simple sans bcrypt pour éviter les problèmes
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "petit-ruban-admin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface AuthUser {
  username: string
  isAdmin: boolean
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  console.log("Validating credentials for:", username)
  console.log("Expected username:", ADMIN_USERNAME)
  console.log("Expected password:", ADMIN_PASSWORD)
  console.log("Received password:", password)

  // Comparaison simple des chaînes
  const isUsernameValid = username === ADMIN_USERNAME
  const isPasswordValid = password === ADMIN_PASSWORD

  console.log("Username valid:", isUsernameValid)
  console.log("Password valid:", isPasswordValid)

  return isUsernameValid && isPasswordValid
}

export function generateToken(user: AuthUser): string {
  // Token simple sans JWT pour éviter les problèmes
  return Buffer.from(JSON.stringify(user)).toString("base64")
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    return decoded as AuthUser
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}
