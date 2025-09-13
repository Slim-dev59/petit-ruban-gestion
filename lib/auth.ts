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

// Stockage sécurisé des mots de passe (en production, utilisez un hash)
const passwords: Record<string, string> = {
  setup: "Setup2024!",
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: "setup-user",
          username: "setup",
          name: "Utilisateur de configuration",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      ],
      currentUser: null,
      sessionExpiry: null,

      login: (username: string, password: string) => {
        const users = get().users
        const user = users.find((u) => u.username === username)

        if (user && passwords[username] === password) {
          const sessionExpiry = Date.now() + 8 * 60 * 60 * 1000 // 8 heures

          // Mettre à jour la dernière connexion
          set((state) => ({
            users: state.users.map((u) => (u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u)),
            currentUser: { ...user, lastLogin: new Date().toISOString() },
            sessionExpiry,
          }))

          return true
        }
        return false
      },

      logout: () => {
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

        // Mettre à jour le mot de passe si fourni
        if (updates.password) {
          passwords[user.username] = updates.password
        }

        // Mettre à jour les informations utilisateur
        const updatedUser = { ...user, ...updates }
        delete (updatedUser as any).password // Retirer le mot de passe des données utilisateur

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

        // Supprimer le mot de passe
        delete passwords[user.username]

        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }))

        return true
      },

      extendSession: () => {
        const currentUser = get().currentUser
        if (currentUser) {
          const sessionExpiry = Date.now() + 8 * 60 * 60 * 1000 // 8 heures
          set({ sessionExpiry })
        }
      },

      isSessionValid: () => {
        const { currentUser, sessionExpiry } = get()
        return currentUser !== null && sessionExpiry !== null && Date.now() < sessionExpiry
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
