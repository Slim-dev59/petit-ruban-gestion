"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Loader } from "lucide-react"

interface HealthStatus {
  status: "healthy" | "unhealthy"
  database: string
  timestamp: string
  error?: string
}

export function DeploymentStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setHealth(data)
      } catch (error) {
        setHealth({
          status: "unhealthy",
          database: "error",
          timestamp: new Date().toISOString(),
          error: String(error),
        })
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin" />
            État du déploiement
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const isHealthy = health?.status === "healthy"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          État du déploiement
        </CardTitle>
        <CardDescription>Statut en temps réel de l'application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Statut global</p>
            <Badge variant={isHealthy ? "default" : "destructive"}>
              {health?.status === "healthy" ? "✅ Sain" : "❌ Problème"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-gray-600">Base de données</p>
            <Badge variant={health?.database === "connected" ? "default" : "destructive"}>
              {health?.database === "connected" ? "🔗 Connectée" : "❌ Déconnectée"}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Dernière vérification: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString("fr-FR") : "N/A"}
        </div>

        {health?.error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{health.error}</div>}
      </CardContent>
    </Card>
  )
}
