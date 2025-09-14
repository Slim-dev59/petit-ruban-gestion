"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  username: string
  name: string
  role: "admin" | "user"
  createdAt: string
  lastLogin?: string
}

interface AuthState {
  users: User[]
  currentUser: User | null
  sessionExpiry: number | null
  login: (username: string, password: string) => boolean
  logout: () => void
  addUser: (username: string, password: string, name: string, role: "admin" | "user") => boolean
  updateUser: (userId: string, updates: Partial<User & { password?: string }>) => boolean
  deleteUser: (userId: string) => boolean
  extendSession: () => void
  isSessionValid: () => boolean
}

// Stockage sécurisé des mots de passe (en production, utiliser une vraie base de données)
const passwords: Record<string, string> = {
  admin: "admin",
  setup: "setup",
  demo: "demo",
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: "admin-user",
          username: "admin",
          name: "Administrateur",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          id: "setup-user",
          username: "setup",
          name: "Utilisateur de configuration",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          id: "demo-user",
          username: "demo",
          name: "Utilisateur de démonstration",
          role: "user",
          createdAt: new Date().toISOString(),
        },
      ],
      currentUser: null,
      sessionExpiry: null,

      login: (username: string, password: string) => {
        console.log("=== TENTATIVE DE CONNEXION ===")
        console.log("Username:", username)
        console.log("Password:", password)

        const users = get().users
        const user = users.find((u) => u.username === username)

        console.log("Utilisateur trouvé:", user)
        console.log("Mot de passe stocké:", passwords[username])
        console.log("Mots de passe disponibles:", Object.keys(passwords))

        if (user && passwords[username] === password) {
          const sessionExpiry = Date.now() + 8 * 60 * 60 * 1000 // 8 heures
          const updatedUser = { ...user, lastLogin: new Date().toISOString() }

          console.log("Connexion réussie, création de la session")
          console.log("Session expire à:", new Date(sessionExpiry))

          set((state) => ({
            users: state.users.map((u) => (u.id === user.id ? updatedUser : u)),
            currentUser: updatedUser,
            sessionExpiry,
          }))

          return true
        }

        console.log("Connexion échouée - identifiants incorrects")
        return false
      },

      logout: () => {
        console.log("Déconnexion de l'utilisateur")
        set({ currentUser: null, sessionExpiry: null })
      },

      addUser: (username: string, password: string, name: string, role: "admin" | "user") => {
        const users = get().users

        if (users.some((u) => u.username === username)) {
          return false
        }

        const newUser: User = {
          id: `user-${Date.now()}`,
          username,
          name,
          role,
          createdAt: new Date().toISOString(),
        }

        passwords[username] = password

        set((state) => ({
          users: [...state.users, newUser],
        }))

        return true
      },

      updateUser: (userId: string, updates: Partial<User & { password?: string }>) => {
        const users = get().users
        const userIndex = users.findIndex((u) => u.id === userId)

        if (userIndex === -1) return false

        const user = users[userIndex]

        if (updates.password) {
          passwords[user.username] = updates.password
        }

        const updatedUser = { ...user, ...updates }
        delete (updatedUser as any).password

        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? updatedUser : u)),
          currentUser: state.currentUser?.id === userId ? updatedUser : state.currentUser,
        }))

        return true
      },

      deleteUser: (userId: string) => {
        const users = get().users
        const user = users.find((u) => u.id === userId)

        if (!user) return false

        delete passwords[user.username]

        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }))

        return true
      },

      extendSession: () => {
        const currentUser = get().currentUser
        if (currentUser) {
          const sessionExpiry = Date.now() + 8 * 60 * 60 * 1000
          console.log("Extension de session jusqu'à:", new Date(sessionExpiry))
          set({ sessionExpiry })
        }
      },

      isSessionValid: () => {
        const { currentUser, sessionExpiry } = get()
        const isValid = currentUser !== null && sessionExpiry !== null && Date.now() < sessionExpiry

        if (!isValid) {
          console.log("Session invalide:")
          console.log("- Utilisateur:", currentUser)
          console.log("- Expiration:", sessionExpiry ? new Date(sessionExpiry) : null)
          console.log("- Maintenant:", new Date())
        }

        return isValid
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)
