"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, User, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function LoginForm() {
  const [username, setUsername] = useState("admin") // Pré-rempli pour faciliter les tests
  const [password, setPassword] = useState("admin123") // Pré-rempli pour faciliter les tests
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [debugInfo, setDebugInfo] = useState("")

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDebugInfo("")

    console.log("Formulaire soumis avec:", { username, password })

    try {
      const success = await login(username.trim(), password.trim())
      console.log("Résultat de la connexion:", success)

      if (!success) {
        setError("Nom d'utilisateur ou mot de passe incorrect")
        setDebugInfo(`Tentative avec: "${username.trim()}" / "${password.trim()}"`)
      }
    } catch (err) {
      console.error("Erreur de connexion:", err)
      setError("Erreur de connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDefaultCredentials = () => {
    setUsername("admin")
    setPassword("admin123")
    setError("")
    setDebugInfo("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Boutique Multi-Créateurs</h1>
          <p className="text-slate-600 font-medium">Connexion sécurisée</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-slate-900">Connexion</CardTitle>
            <CardDescription className="text-slate-600 font-medium">Accédez à votre espace de gestion</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-900 font-semibold">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre nom d'utilisateur"
                    className="pl-10 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-semibold">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="pl-10 pr-10 text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 font-medium">
                    {error}
                    {debugInfo && <div className="text-xs mt-1 opacity-75">Debug: {debugInfo}</div>}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <Button type="submit" className="w-full" disabled={isLoading || !username || !password}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent"
                  onClick={fillDefaultCredentials}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Utiliser les identifiants par défaut
                </Button>
              </div>
            </form>

            {/* Informations par défaut */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">✅ Identifiants de test :</h4>
              <div className="text-sm text-blue-800 space-y-1 font-mono">
                <p>
                  <strong>Utilisateur :</strong> admin
                </p>
                <p>
                  <strong>Mot de passe :</strong> admin123
                </p>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                💡 Cliquez sur "Utiliser les identifiants par défaut" pour les remplir automatiquement
              </p>
            </div>

            {/* Debug info */}
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-700 mb-2 text-sm">🔧 Informations de debug :</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>Valeurs actuelles :</p>
                <p className="font-mono">Username: "{username}"</p>
                <p className="font-mono">Password: "{password}"</p>
                <p className="text-slate-500">Vérifiez la console pour plus de détails</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-slate-600">
          <p>© 2024 Boutique Multi-Créateurs - Sécurisé</p>
        </div>
      </div>
    </div>
  )
}
