"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { LoginForm } from "./login-form"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, isSessionValid, extendSession, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier la session au chargement
    const checkSession = () => {
      console.log("Vérification de la session...")
      console.log("Utilisateur actuel:", currentUser)
      console.log("Session valide:", isSessionValid())

      if (currentUser && isSessionValid()) {
        console.log("Session valide, extension de la session")
        extendSession()
      } else if (currentUser && !isSessionValid()) {
        console.log("Session expirée, déconnexion")
        logout()
      }
      setIsLoading(false)
    }

    // Petit délai pour s'assurer que le store est hydraté
    const timer = setTimeout(checkSession, 100)
    return () => clearTimeout(timer)
  }, [currentUser, isSessionValid, extendSession, logout])

  useEffect(() => {
    // Vérifier la session périodiquement
    const interval = setInterval(() => {
      if (currentUser && !isSessionValid()) {
        console.log("Session expirée lors de la vérification périodique")
        logout()
      }
    }, 60000) // Vérifier toutes les minutes

    return () => clearInterval(interval)
  }, [currentUser, isSessionValid, logout])

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

  console.log("AuthGuard - Utilisateur:", currentUser)
  console.log("AuthGuard - Session valide:", isSessionValid())

  if (!currentUser || !isSessionValid()) {
    return <LoginForm />
  }

  return <>{children}</>
}
