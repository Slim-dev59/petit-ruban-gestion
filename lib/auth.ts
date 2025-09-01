import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "petit-ruban-admin"
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH || "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5W" // "admin123"
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface AuthUser {
  username: string
  isAdmin: boolean
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  console.log("Validating credentials for:", username)

  if (username !== ADMIN_USERNAME) {
    console.log("Username mismatch. Expected:", ADMIN_USERNAME, "Got:", username)
    return false
  }

  try {
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    console.log("Password validation result:", isValid)
    return isValid
  } catch (error) {
    console.error("Error validating credentials:", error)
    return false
  }
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}
