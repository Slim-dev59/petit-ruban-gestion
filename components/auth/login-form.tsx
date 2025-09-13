"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth"
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("VotreNouveauMotDePasse2024!")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const login = useAuth((state) => state.login)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("🔐 Formulaire soumis avec:", { username, password })

    try {
      const success = login(username.trim(), password)

      if (!success) {
        setError("Nom d'utilisateur ou mot de passe incorrect")
        console.log("❌ Échec de la connexion")
      } else {
        console.log("✅ Connexion réussie")
      }
    } catch (err) {
      console.error("💥 Erreur lors de la connexion:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const fillDefaults = () => {
    setUsername("admin")
    setPassword("VotreNouveauMotDePasse2024!")
    setError("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Connexion sécurisée</CardTitle>
            <CardDescription className="text-slate-600 font-medium">Accédez à votre espace de gestion</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informations de debug */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="font-semibold text-blue-800 mb-2">🔍 Informations de connexion :</div>
            <div className="text-blue-700">
              <div>
                Utilisateur actuel : <code className="bg-blue-100 px-1 rounded">{username}</code>
              </div>
              <div>
                Mot de passe : <code className="bg-blue-100 px-1 rounded">{password.substring(0, 8)}...</code>
              </div>
            </div>
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

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={fillDefaults}
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
              >
                Utiliser les identifiants par défaut
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            🔒 Connexion sécurisée avec session de 8 heures
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
