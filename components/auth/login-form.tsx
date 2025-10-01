"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { Lock, User, AlertCircle, Eye, EyeOff, Shield, RefreshCw } from "lucide-react"

const testAccounts = [
  {
    username: "admin",
    password: "admin",
    role: "Administrateur",
    color: "bg-blue-600",
  },
  {
    username: "setup",
    password: "setup",
    role: "Configuration",
    color: "bg-green-600",
  },
  {
    username: "demo",
    password: "demo",
    role: "Démonstration",
    color: "bg-purple-600",
  },
]

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    console.log("=== FORM SUBMIT ===")
    console.log("Attempting login with:", username.trim(), password)

    try {
      const success = login(username.trim(), password)
      console.log("Login result:", success)

      if (!success) {
        setError("Nom d'utilisateur ou mot de passe incorrect")
        console.log("Setting error message")
      } else {
        console.log("Login successful, should redirect now")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const quickLogin = (user: string, pass: string) => {
    console.log("=== QUICK LOGIN ===")
    console.log("Quick login with:", user, pass)

    setUsername(user)
    setPassword(pass)
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      const success = login(user, pass)
      console.log("Quick login result:", success)

      if (!success) {
        setError("Échec de la connexion rapide")
      }
      setIsLoading(false)
    }, 300)
  }

  const resetAuth = () => {
    console.log("=== RESET AUTH ===")
    localStorage.removeItem("auth-storage")
    localStorage.removeItem("boutique-storage")
    sessionStorage.clear()
    console.log("Storage cleared, reloading...")
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
            <CardTitle className="text-2xl font-bold text-slate-900">Le Petit Ruban</CardTitle>
            <CardDescription className="text-slate-600 font-medium">Gestion Multi-Créateurs</CardDescription>
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

          <Separator />

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900 text-center">🔑 Comptes disponibles</p>
            <div className="space-y-2">
              {testAccounts.map((account) => (
                <div
                  key={account.username}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                >
                  <div className="text-sm">
                    <div className="font-bold text-slate-900">{account.username}</div>
                    <div className="text-slate-600 text-xs">
                      Mot de passe: <span className="font-mono font-bold">{account.password}</span>
                    </div>
                    <div className="text-slate-500 text-xs">{account.role}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => quickLogin(account.username, account.password)}
                    disabled={isLoading}
                    className={`${account.color} hover:opacity-90 text-white`}
                  >
                    Connexion
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <Button
            type="button"
            variant="outline"
            onClick={resetAuth}
            className="w-full text-slate-600 hover:text-slate-900 border-slate-300 bg-transparent"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réinitialiser l'authentification
          </Button>

          <div className="text-center text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            🔒 Session sécurisée de 24 heures • Ouvrez la console (F12) pour voir les logs
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
