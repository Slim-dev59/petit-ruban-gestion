"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  username: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  sessionExpiry: number | null

  // Actions
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  checkSession: () => boolean
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  updateUsername: (newUsername: string) => void
}

// Durée de session : 8 heures
const SESSION_DURATION = 8 * 60 * 60 * 1000

// Utilisateurs par défaut - MODIFIEZ LE MOT DE PASSE ICI
const DEFAULT_USERS = [
  {
    id: "admin",
    username: "admin",
    password: "VotreNouveauMotDePasse2024!", // ← NOUVEAU MOT DE PASSE SÉCURISÉ
    role: "admin" as const,
  },
]

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      sessionExpiry: null,

      login: async (username: string, password: string): Promise<boolean> => {
        console.log("Tentative de connexion:", { username, password })

        // Simuler un délai de connexion
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Vérifier les identifiants - DÉBOGAGE AJOUTÉ
        const user = DEFAULT_USERS.find((u) => {
          console.log("Comparaison:", {
            userDb: u.username,
            userInput: username,
            passDb: u.password,
            passInput: password,
            usernameMatch: u.username === username,
            passwordMatch: u.password === password,
          })
          return u.username === username && u.password === password
        })

        console.log("Utilisateur trouvé:", user)

        if (!user) {
          console.log("Échec de connexion - utilisateur non trouvé")
          return false
        }

        const now = Date.now()
        const sessionExpiry = now + SESSION_DURATION

        const authenticatedUser: User = {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }

        console.log("Connexion réussie:", authenticatedUser)

        set({
          user: authenticatedUser,
          isAuthenticated: true,
          sessionExpiry,
        })

        return true
      },

      logout: () => {
        console.log("Déconnexion")
        set({
          user: null,
          isAuthenticated: false,
          sessionExpiry: null,
        })
      },

      checkSession: (): boolean => {
        const { sessionExpiry, isAuthenticated } = get()

        if (!isAuthenticated || !sessionExpiry) {
          console.log("Session invalide - pas authentifié ou pas d'expiration")
          return false
        }

        if (Date.now() > sessionExpiry) {
          console.log("Session expirée")
          // Session expirée
          get().logout()
          return false
        }

        console.log("Session valide")
        return true
      },

      updatePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
        const { user } = get()
        if (!user) return false

        // Vérifier le mot de passe actuel
        const currentUser = DEFAULT_USERS.find((u) => u.username === user.username)
        if (!currentUser || currentUser.password !== currentPassword) {
          return false
        }

        // Mettre à jour le mot de passe dans DEFAULT_USERS
        const userIndex = DEFAULT_USERS.findIndex((u) => u.username === user.username)
        if (userIndex !== -1) {
          DEFAULT_USERS[userIndex].password = newPassword
        }

        console.log(`Mot de passe mis à jour pour ${user.username}`)
        return true
      },

      updateUsername: (newUsername: string) => {
        const { user } = get()
        if (!user) return

        // Mettre à jour le nom d'utilisateur dans DEFAULT_USERS
        const userIndex = DEFAULT_USERS.findIndex((u) => u.username === user.username)
        if (userIndex !== -1) {
          DEFAULT_USERS[userIndex].username = newUsername
        }

        set({
          user: {
            ...user,
            username: newUsername,
          },
        })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)

// Hook pour vérifier l'authentification
export const useAuthGuard = () => {
  const { isAuthenticated, checkSession, logout } = useAuth()

  const isValidSession = checkSession()

  if (isAuthenticated && !isValidSession) {
    logout()
  }

  return isValidSession
}
