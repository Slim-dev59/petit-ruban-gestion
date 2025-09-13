"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { LoginForm } from "./login-form"
import { Loader2, Shield } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, checkSession, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isValidSession, setIsValidSession] = useState(false)

  useEffect(() => {
    // Vérifier la session au montage
    const checkAuth = () => {
      console.log("Vérification de l'authentification...")
      console.log("isAuthenticated:", isAuthenticated)
      console.log("user:", user)

      const valid = checkSession()
      console.log("Session valide:", valid)

      setIsValidSession(valid)
      setIsLoading(false)
    }

    // Petit délai pour éviter les flashs
    setTimeout(checkAuth, 100)

    // Vérifier la session périodiquement (toutes les minutes)
    const interval = setInterval(checkAuth, 60000)

    return () => clearInterval(interval)
  }, [checkSession, isAuthenticated, user])

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Vérification de la session...</p>
          <p className="text-xs text-slate-500 mt-2">Chargement de l'application sécurisée</p>
        </div>
      </div>
    )
  }

  // Si pas authentifié ou session expirée, afficher le formulaire de connexion
  if (!isAuthenticated || !isValidSession) {
    console.log("Redirection vers login - Auth:", isAuthenticated, "Valid:", isValidSession)
    return <LoginForm />
  }

  // Si authentifié, afficher l'application
  console.log("Utilisateur authentifié, affichage de l'application")
  return <>{children}</>
}
