"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { LogIn, User, Key, RefreshCw, AlertCircle, Trash2 } from "lucide-react"

const testAccounts = [
  {
    username: "admin",
    password: "admin",
    role: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  {
    username: "setup",
    password: "setup",
    role: "Configuration",
    description: "Gestion des paramètres et configuration",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    username: "demo",
    password: "demo",
    role: "Démonstration",
    description: "Accès en lecture seule pour la démonstration",
    color: "bg-green-100 text-green-800 border-green-200",
  },
]

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = login(username.trim(), password)

      if (!success) {
        setError("Identifiants incorrects. Veuillez réessayer.")
      }
    } catch (err) {
      setError("Erreur lors de la connexion. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (testUsername: string, testPassword: string) => {
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      const success = login(testUsername, testPassword)
      if (!success) {
        setError("Erreur lors de la connexion rapide")
      }
      setIsLoading(false)
    }, 500)
  }

  const handleReset = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser l'authentification ? Cela supprimera toutes les données de session.",
      )
    ) {
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Le Petit Ruban</h1>
          <p className="text-slate-600">Gestion Multi-Créateurs</p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center text-slate-900">Connexion</CardTitle>
            <CardDescription className="text-center text-slate-600">
              Connectez-vous à votre espace de gestion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-900 font-medium">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre nom d'utilisateur"
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !username.trim() || !password.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* Comptes de test */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-900 text-center">Comptes de démonstration</h3>
              <div className="space-y-2">
                {testAccounts.map((account) => (
                  <div
                    key={account.username}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={account.color}>
                          {account.role}
                        </Badge>
                        <code className="text-xs text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                          {account.username}/{account.password}
                        </code>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{account.description}</p>
                    </div>
                    <Button
                      onClick={() => handleQuickLogin(account.username, account.password)}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="ml-2 text-xs hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <LogIn className="h-3 w-3 mr-1" />
                          Connexion
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Bouton de réinitialisation */}
            <div className="text-center">
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Réinitialiser l'authentification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <p>© 2024 Le Petit Ruban - Gestion Multi-Créateurs</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  )
}
