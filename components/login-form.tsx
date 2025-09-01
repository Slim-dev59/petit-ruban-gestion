"use client"

import type React from "react"
import { useState } from "react"
import { Shield, Eye, EyeOff, Lock, User } from "lucide-react"

interface LoginFormProps {
  onLogin: (success: boolean) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("Attempting login with:", { username, password: "***" })

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Login response status:", response.status)
      const data = await response.json()
      console.log("Login response data:", data)

      if (data.success) {
        onLogin(true)
      } else {
        setError(data.message || "Identifiants incorrects")
        onLogin(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Erreur de connexion")
      onLogin(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Petit-Ruban</h1>
          <p className="text-gray-600">Gestion Multi-Créateurs v17</p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-red-50 border border-red-200 rounded-full">
            <Lock className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-800">Accès Sécurisé</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="petit-ruban-admin"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="admin123"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connexion...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Se connecter
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-xs text-gray-500">
              <p>🔒 Connexion sécurisée avec chiffrement</p>
              <p className="mt-1">Session automatiquement expirée après 24h</p>
              <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">Identifiants de test :</p>
                <p className="text-blue-700">Username: petit-ruban-admin</p>
                <p className="text-blue-700">Password: admin123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 Petit-Ruban - Tous droits réservés</p>
          <p className="mt-1">Version 17 - Déploiement sécurisé</p>
        </div>
      </div>
    </div>
  )
}
