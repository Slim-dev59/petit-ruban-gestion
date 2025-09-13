"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Settings, LogOut, Clock, Shield } from "lucide-react"

export function UserMenu() {
  const { user, logout, updateUser, sessionExpiry } = useAuth()
  const [showSettings, setShowSettings] = useState(false)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleUpdateUser = () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }

    const updates: any = { displayName }
    if (newPassword) {
      updates.password = newPassword
    }

    updateUser(updates)
    setShowSettings(false)
    setNewPassword("")
    setConfirmPassword("")
  }

  const getTimeRemaining = () => {
    if (!sessionExpiry) return "Session expirée"

    const remaining = sessionExpiry - Date.now()
    if (remaining <= 0) return "Session expirée"

    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m restantes`
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200">
            <User className="h-5 w-5 text-slate-700" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 bg-white border-slate-200" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-slate-900">{user?.displayName}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Clock className="h-3 w-3" />
                <span>{getTimeRemaining()}</span>
              </div>
              <div className="text-xs text-slate-500">@{user?.username}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres utilisateur</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-slate-900">Paramètres utilisateur</DialogTitle>
            <DialogDescription className="text-slate-600">
              Modifiez vos informations personnelles et votre mot de passe
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName" className="text-slate-900 font-semibold">
                Nom d'affichage
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-slate-900"
              />
            </div>

            <div>
              <Label htmlFor="newPassword" className="text-slate-900 font-semibold">
                Nouveau mot de passe (optionnel)
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-slate-900"
              />
            </div>

            {newPassword && (
              <div>
                <Label htmlFor="confirmPassword" className="text-slate-900 font-semibold">
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-slate-900"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="border-slate-200 text-slate-700"
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateUser}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
