"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  username: string
  password: string
  displayName: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  sessionExpiry: number | null
  login: (username: string, password: string) => boolean
  logout: () => void
  updateUser: (updates: Partial<Pick<User, "displayName" | "password">>) => void
  isSessionValid: () => boolean
  extendSession: () => void
}

const DEFAULT_USERS: User[] = [
  {
    username: "admin",
    password: "VotreNouveauMotDePasse2024!",
    displayName: "Administrateur",
  },
]

const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 heures en millisecondes

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      sessionExpiry: null,

      login: (username: string, password: string) => {
        console.log("🔐 Tentative de connexion:", { username, password })

        const user = DEFAULT_USERS.find((u) => u.username === username && u.password === password)

        console.log("👤 Utilisateur trouvé:", user ? "Oui" : "Non")

        if (user) {
          const expiry = Date.now() + SESSION_DURATION
          set({
            isAuthenticated: true,
            user,
            sessionExpiry: expiry,
          })
          console.log("✅ Connexion réussie, session expire à:", new Date(expiry))
          return true
        }

        console.log("❌ Échec de la connexion")
        return false
      },

      logout: () => {
        console.log("🚪 Déconnexion")
        set({
          isAuthenticated: false,
          user: null,
          sessionExpiry: null,
        })
      },

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates }
          set({ user: updatedUser })

          // Mettre à jour dans DEFAULT_USERS pour la persistance
          const userIndex = DEFAULT_USERS.findIndex((u) => u.username === currentUser.username)
          if (userIndex !== -1) {
            DEFAULT_USERS[userIndex] = updatedUser
          }
        }
      },

      isSessionValid: () => {
        const { sessionExpiry, isAuthenticated } = get()
        if (!isAuthenticated || !sessionExpiry) {
          return false
        }

        const isValid = Date.now() < sessionExpiry
        if (!isValid) {
          console.log("⏰ Session expirée")
          get().logout()
        }

        return isValid
      },

      extendSession: () => {
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          const newExpiry = Date.now() + SESSION_DURATION
          set({ sessionExpiry: newExpiry })
          console.log("🔄 Session prolongée jusqu'à:", new Date(newExpiry))
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)
