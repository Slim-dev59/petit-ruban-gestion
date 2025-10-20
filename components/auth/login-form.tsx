"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { Lock, User, AlertCircle, Eye, EyeOff, Shield } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const login = useAuth((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("📝 Formulaire soumis avec:", { username, password })

    try {
      const success = login(username.trim(), password)

      if (!success) {
        setError("Nom d'utilisateur ou mot de passe incorrect")
        console.log("❌ Échec de connexion")
      } else {
        console.log("✅ Connexion réussie depuis le formulaire")
      }
    } catch (err) {
      console.error("💥 Erreur lors de la connexion:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = () => {
    console.log("🚀 Connexion rapide")
    setUsername("setup")
    setPassword("test")
    setError("")

    setTimeout(() => {
      const success = login("setup", "test")
      if (!success) {
        setError("Échec de la connexion rapide")
      }
    }, 100)
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
                  autoComplete="username"
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
                  autoComplete="current-password"
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

          <div className="pt-4 border-t">
            <Button
              onClick={quickLogin}
              variant="outline"
              className="w-full border-2 border-blue-200 hover:bg-blue-50 bg-transparent"
            >
              🚀 Connexion rapide (setup / test)
            </Button>
          </div>

          <div className="text-center space-y-2">
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">🔒 Session sécurisée de 8 heures</div>
            <div className="text-xs text-slate-600 bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="font-semibold mb-1">Identifiants par défaut:</div>
              <div className="font-mono">Utilisateur: setup</div>
              <div className="font-mono">Mot de passe: test</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
