"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import LoginForm from "./login-form"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isSessionValid, extendSession, currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("Vérification de la session...")
    console.log("Utilisateur actuel:", currentUser)
    console.log("Session valide:", isSessionValid())

    if (isAuthenticated && isSessionValid()) {
      console.log("Session valide, extension de la session")
      extendSession()
    }

    setIsLoading(false)
  }, [isAuthenticated, isSessionValid, extendSession, currentUser])

  useEffect(() => {
    console.log("AuthGuard - Utilisateur:", currentUser)
    console.log("AuthGuard - Session valide:", isSessionValid())
  }, [currentUser, isSessionValid])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isSessionValid()) {
    return <LoginForm />
  }

  return <>{children}</>
}
