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

  // Actions d'authentification
  login: (username: string, password: string) => boolean
  logout: () => void
  isSessionValid: () => boolean
  extendSession: () => void

  // Actions de gestion des utilisateurs
  addUser: (userData: Omit<User, "id" | "createdAt">) => boolean
  updateUser: (userId: string, updates: Partial<Pick<User, "username" | "displayName" | "role">>) => boolean
  updatePassword: (userId: string, newPassword: string) => boolean
  deleteUser: (userId: string) => boolean
  getAllUsers: () => User[]
}

const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 heures

// Utilisateur temporaire pour l'accès initial (à supprimer après création d'un admin)
const INITIAL_USER: User = {
  id: "temp-admin",
  username: "setup",
  password: "Setup2024!",
  displayName: "Configuration Initiale",
  role: "admin",
  createdAt: new Date().toISOString(),
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: null,
      users: [INITIAL_USER],
      sessionExpiry: null,

      login: (username: string, password: string) => {
        const { users } = get()
        const user = users.find((u) => u.username === username && u.password === password)

        if (user) {
          const expiry = Date.now() + SESSION_DURATION
          const updatedUser = { ...user, lastLogin: new Date().toISOString() }

          // Mettre à jour la dernière connexion
          set((state) => ({
            isAuthenticated: true,
            currentUser: updatedUser,
            sessionExpiry: expiry,
            users: state.users.map((u) => (u.id === user.id ? updatedUser : u)),
          }))

          return true
        }

        return false
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          sessionExpiry: null,
        })
      },

      isSessionValid: () => {
        const { sessionExpiry, isAuthenticated } = get()
        if (!isAuthenticated || !sessionExpiry) {
          return false
        }

        const isValid = Date.now() < sessionExpiry
        if (!isValid) {
          get().logout()
        }

        return isValid
      },

      extendSession: () => {
        const { isAuthenticated } = get()
        if (isAuthenticated) {
          const newExpiry = Date.now() + SESSION_DURATION
          set({ sessionExpiry: newExpiry })
        }
      },

      addUser: (userData) => {
        const { users } = get()

        // Vérifier si le nom d'utilisateur existe déjà
        if (users.some((u) => u.username === userData.username)) {
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

        return true
      },

      updateUser: (userId, updates) => {
        const { users } = get()

        // Vérifier si le nouveau nom d'utilisateur existe déjà (si on le change)
        if (updates.username && users.some((u) => u.id !== userId && u.username === updates.username)) {
          return false
        }

        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser,
        }))

        return true
      },

      updatePassword: (userId, newPassword) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)),
        }))

        return true
      },

      deleteUser: (userId) => {
        const { users, currentUser } = get()

        // Empêcher la suppression du dernier admin
        const admins = users.filter((u) => u.role === "admin")
        const userToDelete = users.find((u) => u.id === userId)

        if (userToDelete?.role === "admin" && admins.length === 1) {
          return false // Ne peut pas supprimer le dernier admin
        }

        // Empêcher la suppression de son propre compte
        if (currentUser?.id === userId) {
          return false
        }

        set((state) => ({
          users: state.users.filter((u) => u.id !== userId),
        }))

        return true
      },

      getAllUsers: () => {
        return get().users
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        users: state.users,
        sessionExpiry: state.sessionExpiry,
      }),
    },
  ),
)
