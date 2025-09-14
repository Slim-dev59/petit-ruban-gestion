"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { LoginForm } from "./login-form"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { currentUser, isSessionValid, logout } = useAuth()

  useEffect(() => {
    // Vérifier la validité de la session toutes les minutes
    const interval = setInterval(() => {
      if (currentUser && !isSessionValid()) {
        logout()
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [currentUser, isSessionValid, logout])

  if (!currentUser || !isSessionValid()) {
    return <LoginForm />
  }

  return <>{children}</>
}
