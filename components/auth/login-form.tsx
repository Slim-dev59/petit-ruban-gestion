"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, getDefaultCredentials } from "@/lib/auth"
import { Eye, EyeOff, User, Lock } from "lucide-react"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const login = useAuth((state) => state.login)
  const credentials = getDefaultCredentials()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = login(username, password)
      if (!success) {
        setError("Nom d'utilisateur ou mot de passe incorrect")
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (cred: { username: string; password: string }) => {
    setUsername(cred.username)
    setPassword(cred.password)
    login(cred.username, cred.password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-black">Boutique Multi-Créateurs</CardTitle>
          <CardDescription className="text-center text-black">Connectez-vous à votre espace de gestion</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-black">
                Nom d'utilisateur
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 text-black"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-black">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 text-black"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-black">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full text-black"
            >
              {showCredentials ? "Masquer" : "Afficher"} les identifiants de test
            </Button>

            {showCredentials && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-black mb-2">Comptes de test :</p>
                {Object.entries(credentials).map(([key, cred]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="text-sm text-black">
                      <div className="font-medium">{cred.username}</div>
                      <div className="text-gray-600">{cred.password}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleQuickLogin(cred)} className="text-black">
                      Connexion
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
