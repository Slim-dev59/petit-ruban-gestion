"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  username: string
  email: string
  role: "admin" | "manager" | "viewer"
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

interface AuthState {
  currentUser: User | null
  isAuthenticated: boolean
  sessionExpiry: number | null

  // Actions
  login: (username: string, password: string) => boolean
  logout: () => void
  isSessionValid: () => boolean
  extendSession: () => void
  getCurrentUser: () => User | null
}

const defaultUsers: User[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@petit-ruban.fr",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    username: "setup",
    email: "setup@petit-ruban.fr",
    role: "manager",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    username: "demo",
    email: "demo@petit-ruban.fr",
    role: "viewer",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      sessionExpiry: null,

      login: (username: string, password: string) => {
        console.log("🔐 Tentative de connexion:", username)

        // Validation des identifiants
        const validCredentials = [
          { username: "admin", password: "admin" },
          { username: "setup", password: "setup" },
          { username: "demo", password: "demo" },
        ]

        const isValidCredential = validCredentials.find(
          (cred) => cred.username === username && cred.password === password,
        )

        if (!isValidCredential) {
          console.log("❌ Identifiants invalides")
          return false
        }

        const user = defaultUsers.find((u) => u.username === username)
        if (!user || !user.isActive) {
          console.log("❌ Utilisateur non trouvé ou inactif")
          return false
        }

        const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 heures

        set({
          currentUser: { ...user, lastLogin: new Date().toISOString() },
          isAuthenticated: true,
          sessionExpiry,
        })

        console.log("✅ Connexion réussie:", user.username, user.role)
        return true
      },

      logout: () => {
        console.log("🚪 Déconnexion")
        set({
          currentUser: null,
          isAuthenticated: false,
          sessionExpiry: null,
        })
      },

      isSessionValid: () => {
        const { sessionExpiry, isAuthenticated } = get()
        if (!isAuthenticated || !sessionExpiry) {
          return false
        }
        return Date.now() < sessionExpiry
      },

      extendSession: () => {
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          const newExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 heures
          set({ sessionExpiry: newExpiry })
          console.log("🔄 Session étendue jusqu'à:", new Date(newExpiry).toLocaleString())
        }
      },

      getCurrentUser: () => {
        return get().currentUser
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)
