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
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  addUser: (username: string, password: string, name: string, role: "admin" | "user") => boolean
  updateUser: (userId: string, updates: Partial<User & { password?: string }>) => boolean
  deleteUser: (userId: string) => boolean
  extendSession: () => void
  isSessionValid: () => boolean
  checkSession: () => boolean
}

// Stockage des mots de passe
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
          name: "Configuration",
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        {
          id: "demo-user",
          username: "demo",
          name: "Démonstration",
          role: "user",
          createdAt: new Date().toISOString(),
        },
      ],
      currentUser: null,
      sessionExpiry: null,
      isAuthenticated: false,

      login: (username: string, password: string) => {
        console.log("=== LOGIN ATTEMPT ===")
        console.log("Username:", username)
        console.log("Password:", password)

        const users = get().users
        const user = users.find((u) => u.username === username)

        console.log("User found:", user)
        console.log("Expected password:", passwords[username])

        if (user && passwords[username] === password) {
          const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000
          const updatedUser = { ...user, lastLogin: new Date().toISOString() }

          console.log("Login successful, setting state...")

          set({
            users: get().users.map((u) => (u.id === user.id ? updatedUser : u)),
            currentUser: updatedUser,
            sessionExpiry,
            isAuthenticated: true,
          })

          console.log("State updated successfully")
          console.log("Current user:", get().currentUser)
          console.log("Is authenticated:", get().isAuthenticated)

          return true
        }

        console.log("Login failed - invalid credentials")
        return false
      },

      logout: () => {
        console.log("=== LOGOUT ===")
        set({
          currentUser: null,
          sessionExpiry: null,
          isAuthenticated: false,
        })
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
          const sessionExpiry = Date.now() + 24 * 60 * 60 * 1000
          set({ sessionExpiry })
          console.log("Session extended until:", new Date(sessionExpiry))
        }
      },

      isSessionValid: () => {
        const { currentUser, sessionExpiry, isAuthenticated } = get()
        const valid = isAuthenticated && currentUser !== null && sessionExpiry !== null && Date.now() < sessionExpiry

        if (!valid) {
          console.log("Session invalid:")
          console.log("- Authenticated:", isAuthenticated)
          console.log("- Current user:", currentUser)
          console.log("- Expiry:", sessionExpiry ? new Date(sessionExpiry) : null)
          console.log("- Now:", new Date())
        }

        return valid
      },

      checkSession: () => {
        const valid = get().isSessionValid()
        console.log("Check session result:", valid)
        return valid
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        users: state.users,
        currentUser: state.currentUser,
        sessionExpiry: state.sessionExpiry,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// Export alias
export const useAuthStore = useAuth
