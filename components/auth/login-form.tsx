"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import { Eye, EyeOff, LogIn, RefreshCw, AlertCircle, User, Shield, EyeIcon } from "lucide-react"

const testAccounts = [
  {
    username: "admin",
    password: "admin",
    role: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    icon: Shield,
    color: "bg-red-500",
  },
  {
    username: "setup",
    password: "setup",
    role: "Configuration",
    description: "Accès aux paramètres et configuration",
    icon: User,
    color: "bg-blue-500",
  },
  {
    username: "demo",
    password: "demo",
    role: "Démonstration",
    description: "Accès en lecture seule pour la démonstration",
    icon: EyeIcon,
    color: "bg-green-500",
  },
]

export function LoginForm() {
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = login(username.trim(), password)
      if (!success) {
        setError("Identifiants incorrects. Veuillez réessayer.")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (account: (typeof testAccounts)[0]) => {
    setUsername(account.username)
    setPassword(account.password)
    setIsLoading(true)
    setError("")

    setTimeout(() => {
      const success = login(account.username, account.password)
      if (!success) {
        setError("Erreur lors de la connexion rapide.")
      }
      setIsLoading(false)
    }, 500)
  }

  const resetAuth = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Le Petit Ruban</h1>
          <p className="text-slate-600">Gestion Multi-Créateurs</p>
        </div>

        {/* Login Form */}
        <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-slate-900">Connexion</CardTitle>
            <CardDescription className="text-center text-slate-600">
              Connectez-vous à votre espace de gestion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-900">
                  Nom d'utilisateur
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Saisissez votre nom d'utilisateur"
                  required
                  className="text-slate-900 bg-white/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe"
                    required
                    className="text-slate-900 bg-white/50 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
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

            {/* Quick Login */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900 text-center">Connexion rapide</p>
              <div className="grid gap-2">
                {testAccounts.map((account) => {
                  const IconComponent = account.icon
                  return (
                    <Button
                      key={account.username}
                      variant="outline"
                      onClick={() => handleQuickLogin(account)}
                      disabled={isLoading}
                      className="w-full justify-start h-auto p-3 text-left bg-white/50 hover:bg-white/80 border-slate-200"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div className={`w-8 h-8 rounded-lg ${account.color} flex items-center justify-center`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-slate-900">{account.username}</span>
                            <Badge variant="secondary" className="text-xs">
                              {account.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 truncate">{account.description}</p>
                        </div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Reset Button */}
            <Button
              variant="ghost"
              onClick={resetAuth}
              className="w-full text-slate-600 hover:text-slate-900"
              size="sm"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Réinitialiser l'authentification
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-slate-500">
          <p>© 2024 Le Petit Ruban. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}
