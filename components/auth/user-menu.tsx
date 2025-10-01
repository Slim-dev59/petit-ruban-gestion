"use client"

import React from "react"

import type { ReactElement } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth"
import { User, LogOut, Settings, Shield, Clock } from "lucide-react"

export function UserMenu(): ReactElement | null {
  const { currentUser, logout, sessionExpiry } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState("")

  // Calculer le temps restant de session
  const updateTimeRemaining = () => {
    if (sessionExpiry) {
      const remaining = sessionExpiry - Date.now()
      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else {
        setTimeRemaining("Expirée")
      }
    }
  }

  React.useEffect(() => {
    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 60000) // Mise à jour chaque minute

    return () => clearInterval(interval)
  }, [sessionExpiry])

  const handleLogout = () => {
    logout()
  }

  if (!currentUser) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <span className="text-white font-semibold">{currentUser.displayName.charAt(0).toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium leading-none text-slate-900">{currentUser.displayName}</p>
                <p className="text-xs leading-none text-slate-500 mt-1">@{currentUser.username}</p>
              </div>
              <Badge variant={currentUser.role === "admin" ? "default" : "secondary"} className="text-xs">
                {currentUser.role === "admin" ? (
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Admin</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>User</span>
                  </div>
                )}
              </Badge>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
              <Clock className="h-3 w-3" />
              <span>Session: {timeRemaining}</span>
            </div>

            {currentUser.lastLogin && (
              <div className="text-xs text-slate-500">
                Dernière connexion:{" "}
                {new Date(currentUser.lastLogin).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres du profil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
