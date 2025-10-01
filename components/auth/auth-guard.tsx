"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { LoginForm } from "./login-form"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isSessionValid, extendSession } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = () => {
      isSessionValid()
      setIsLoading(false)
    }

    checkSession()

    const interval = setInterval(
      () => {
        if (isAuthenticated && isSessionValid()) {
          extendSession()
        }
      },
      30 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [isAuthenticated, isSessionValid, extendSession])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Vérification de la session...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isSessionValid()) {
    return <LoginForm />
  }

  return <>{children}</>
}
