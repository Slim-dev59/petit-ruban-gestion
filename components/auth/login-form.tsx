"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { Lock, User, AlertCircle, Eye, EyeOff, Shield, RefreshCw } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCredentials, setShowCredentials] = useState(true) // Afficher par défaut

  const login = useAuth((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("=== FORMULAIRE DE CONNEXION ===")
      console.log("Tentative avec:", username.trim(), password)

      const success = login(username.trim(), password)

      if (!success) {
        setError("Nom d'utilisateur ou mot de passe incorrect")
        console.log("Échec de la connexion")
      } else {
        console.log("Connexion réussie depuis le formulaire")
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = (user: string, pass: string) => {
    console.log("=== CONNEXION RAPIDE ===")
    console.log("Connexion rapide avec:", user, pass)

    setUsername(user)
    setPassword(pass)
    setError("")

    const success = login(user, pass)
    if (!success) {
      setError("Échec de la connexion rapide")
      console.log("Échec de la connexion rapide")
    } else {
      console.log("Connexion rapide réussie")
    }
  }

  const resetAuth = () => {
    // Nettoyer le localStorage pour forcer une réinitialisation
    localStorage.removeItem("auth-storage")
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Connexion</CardTitle>
            <CardDescription className="text-slate-600 font-medium">
              Accédez à votre espace de gestion sécurisé
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bouton de réinitialisation en cas de problème */}
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetAuth}
              className="text-slate-500 hover:text-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Réinitialiser l'authentification
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-900 font-semibold">
                Nom d'utilisateur
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 text-slate-900 border-slate-300 focus:border-blue-500"
                  placeholder="Entrez votre nom d'utilisateur"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-900 font-semibold">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 text-slate-900 border-slate-300 focus:border-blue-500"
                  placeholder="Entrez votre mot de passe"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 shadow-lg"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          {/* Comptes de test toujours visibles */}
          <div className="space-y-3">
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCredentials(!showCredentials)}
                className="w-full text-slate-900"
              >
                {showCredentials ? "Masquer" : "Afficher"} les comptes de test
              </Button>
            </div>

            {showCredentials && (
              <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm font-medium text-slate-900 mb-3 text-center">🔑 Comptes de test disponibles :</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                    <div className="text-sm text-slate-900">
                      <div className="font-bold text-blue-600">admin</div>
                      <div className="text-slate-500">Mot de passe: admin</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => quickLogin("admin", "admin")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Connexion
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                    <div className="text-sm text-slate-900">
                      <div className="font-bold text-green-600">setup</div>
                      <div className="text-slate-500">Mot de passe: setup</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => quickLogin("setup", "setup")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Connexion
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                    <div className="text-sm text-slate-900">
                      <div className="font-bold text-purple-600">demo</div>
                      <div className="text-slate-500">Mot de passe: demo</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => quickLogin("demo", "demo")}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Connexion
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            🔒 Connexion sécurisée avec session de 8 heures
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
