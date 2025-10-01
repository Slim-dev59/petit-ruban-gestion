"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { LoginForm } from "./login-form"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, isAuthenticated, checkSession, extendSession } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("=== AUTH GUARD INIT ===")
    console.log("Current user:", currentUser)
    console.log("Is authenticated:", isAuthenticated)

    const timer = setTimeout(() => {
      const sessionValid = checkSession()
      console.log("Session check result:", sessionValid)

      if (sessionValid && currentUser) {
        console.log("Session valid, extending...")
        extendSession()
      }

      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [currentUser, isAuthenticated, checkSession, extendSession])

  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      const sessionValid = checkSession()
      if (!sessionValid) {
        console.log("Session expired during periodic check")
        setIsLoading(false)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [isAuthenticated, checkSession])

  console.log("=== AUTH GUARD RENDER ===")
  console.log("Is loading:", isLoading)
  console.log("Is authenticated:", isAuthenticated)
  console.log("Current user:", currentUser)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !currentUser) {
    console.log("Not authenticated, showing login form")
    return <LoginForm />
  }

  console.log("Authenticated, showing app content")
  return <>{children}</>
}
