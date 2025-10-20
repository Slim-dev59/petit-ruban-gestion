"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  username: string
  password: string
  displayName: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
}

interface AuthState {
  isAuthenticated: boolean
  currentUser: User | null
  users: User[]
  sessionExpiry: number | null

  login: (username: string, password: string) => boolean
  logout: () => void
  isSessionValid: () => boolean
  extendSession: () => void
  addUser: (userData: Omit<User, "id" | "createdAt">) => boolean
  updateUser: (userId: string, updates: Partial<Pick<User, "username" | "displayName" | "role">>) => boolean
  updatePassword: (userId: string, newPassword: string) => boolean
  deleteUser: (userId: string) => boolean
  getAllUsers: () => User[]
  resetToDefault: () => void
}

const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 heures

const DEFAULT_USERS: User[] = [
  {
    id: "admin-1",
    username: "setup",
    password: "test",
    displayName: "Administrateur",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin-2",
    username: "admin",
    password: "admin",
    displayName: "Admin Principal",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user-1",
    username: "demo",
    password: "demo",
    displayName: "Utilisateur Démo",
    role: "user",
    createdAt: new Date().toISOString(),
  },
]

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      users: DEFAULT_USERS,
      sessionExpiry: null,

      login: (username: string, password: string) => {
        console.log("🔐 Tentative de connexion:", { username, password })

        const { users } = get()
        console.log(
          "👥 Utilisateurs disponibles:",
          users.map((u) => ({ id: u.id, username: u.username })),
        )

        const user = users.find((u) => {
          console.log(`Comparaison: ${u.username} === ${username} && ${u.password} === ${password}`)
          return u.username === username && u.password === password
        })

        console.log("✅ Utilisateur trouvé:", user ? { id: user.id, username: user.username } : "AUCUN")

        if (user) {
          const expiry = Date.now() + SESSION_DURATION
          const updatedUser = { ...user, lastLogin: new Date().toISOString() }

          set((state) => ({
            isAuthenticated: true,
            currentUser: updatedUser,
            sessionExpiry: expiry,
            users: state.users.map((u) => (u.id === user.id ? updatedUser : u)),
          }))

          console.log("✅ Connexion réussie!")
          console.log("État après connexion:", {
            isAuthenticated: true,
            currentUser: updatedUser.username,
          })
          return true
        }

        console.log("❌ Connexion échouée")
        return false
      },

      logout: () => {
        console.log("🚪 Déconnexion")
        set({
          isAuthenticated: false,
          currentUser: null,
          sessionExpiry: null,
        })
      },

      isSessionValid: () => {
        const { sessionExpiry, isAuthenticated } = get()

        if (!isAuthenticated || !sessionExpiry) {
          console.log("❌ Session invalide: pas authentifié ou pas d'expiration")
          return false
        }

        const isValid = Date.now() < sessionExpiry
        console.log("🕐 Vérification session:", {
          now: new Date(Date.now()).toLocaleString(),
          expiry: new Date(sessionExpiry).toLocaleString(),
          isValid,
        })

        if (!isValid) {
          console.log("⏰ Session expirée, déconnexion")
          get().logout()
        }

        return isValid
      },

      extendSession: () => {
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          const newExpiry = Date.now() + SESSION_DURATION
          set({ sessionExpiry: newExpiry })
          console.log("⏰ Session prolongée jusqu'à:", new Date(newExpiry).toLocaleString())
        }
      },

      addUser: (userData) => {
        const { users } = get()

        if (users.some((u) => u.username === userData.username)) {
          console.log("❌ Nom d'utilisateur déjà existant")
          return false
        }

        const newUser: User = {
          ...userData,
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, newUser],
        }))

        console.log("✅ Nouvel utilisateur créé:", newUser.username)
        return true
      },

      updateUser: (userId, updates) => {
        const { users } = get()

        if (updates.username && users.some((u) => u.id !== userId && u.username === updates.username)) {
          console.log("❌ Nom d'utilisateur déjà existant")
          return false
        }

        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser,
        }))

        console.log("✅ Utilisateur mis à jour")
        return true
      },

      updatePassword: (userId, newPassword) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)),
        }))

        console.log("✅ Mot de passe mis à jour")
        return true
      },

      deleteUser: (userId) => {
        const { users, currentUser } = get()

        const admins = users.filter((u) => u.role === "admin")
        const userToDelete = users.find((u) => u.id === userId)

        if (userToDelete?.role === "admin" && admins.length === 1) {
          console.log("❌ Impossible de supprimer le dernier admin")
          return false
        }

        if (currentUser?.id === userId) {
          console.log("❌ Impossible de supprimer son propre compte")
          return false
        }

        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }))

        console.log("✅ Utilisateur supprimé")
        return true
      },

      getAllUsers: () => {
        return get().users
      },

      resetToDefault: () => {
        console.log("🔄 Réinitialisation aux paramètres par défaut")
        set({
          isAuthenticated: false,
          currentUser: null,
          users: DEFAULT_USERS,
          sessionExpiry: null,
        })
      },
    }),
    {
      name: "auth-storage",
      version: 1,
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        users: state.users,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)
