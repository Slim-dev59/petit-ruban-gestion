"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, LogOut, Settings, Shield, Key, CheckCircle, AlertTriangle } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function UserMenu() {
  const { user, logout, updatePassword, updateUsername } = useAuth()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newUsername, setNewUsername] = useState(user?.username || "")
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [usernameStatus, setUsernameStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  if (!user) return null

  const handlePasswordUpdate = async () => {
    setPasswordStatus(null)

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Les mots de passe ne correspondent pas" })
      return
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: "error", message: "Le mot de passe doit contenir au moins 6 caractères" })
      return
    }

    const success = await updatePassword(currentPassword, newPassword)

    if (success) {
      setPasswordStatus({ type: "success", message: "Mot de passe mis à jour avec succès" })
      setTimeout(() => {
        setShowPasswordDialog(false)
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setPasswordStatus(null)
      }, 2000)
    } else {
      setPasswordStatus({ type: "error", message: "Mot de passe actuel incorrect" })
    }
  }

  const handleUsernameUpdate = () => {
    setUsernameStatus(null)

    if (newUsername.trim().length < 3) {
      setUsernameStatus({ type: "error", message: "Le nom d'utilisateur doit contenir au moins 3 caractères" })
      return
    }

    updateUsername(newUsername.trim())
    setUsernameStatus({ type: "success", message: "Nom d'utilisateur mis à jour avec succès" })

    setTimeout(() => {
      setShowUsernameDialog(false)
      setUsernameStatus(null)
    }, 2000)
  }

  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout()
    }
  }

  const getSessionTimeRemaining = () => {
    const { sessionExpiry } = useAuth.getState()
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
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 bg-transparent"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">{user.username}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              {user.role}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-white border-slate-200">
          <DropdownMenuLabel className="text-slate-900">
            <div className="flex flex-col space-y-1">
              <p className="font-semibold">{user.username}</p>
              <p className="text-xs text-slate-600 font-normal">{getSessionTimeRemaining()}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowUsernameDialog(true)} className="text-slate-700 hover:bg-slate-50">
            <Settings className="mr-2 h-4 w-4" />
            Changer le nom d'utilisateur
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowPasswordDialog(true)} className="text-slate-700 hover:bg-slate-50">
            <Key className="mr-2 h-4 w-4" />
            Changer le mot de passe
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog changement de mot de passe */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Shield className="h-5 w-5" />
              Changer le mot de passe
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Saisissez votre mot de passe actuel et choisissez un nouveau mot de passe sécurisé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-slate-900 font-semibold">
                Mot de passe actuel
              </Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-900 font-semibold">
                Nouveau mot de passe
              </Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-900 font-semibold">
                Confirmer le nouveau mot de passe
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-slate-900"
              />
            </div>

            {passwordStatus && (
              <Alert
                variant={passwordStatus.type === "error" ? "destructive" : "default"}
                className="bg-white border-slate-200"
              >
                {passwordStatus.type === "error" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription className="text-slate-900 font-medium">{passwordStatus.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={!currentPassword || !newPassword || !confirmPassword}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog changement de nom d'utilisateur */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <User className="h-5 w-5" />
              Changer le nom d'utilisateur
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Modifiez votre nom d'utilisateur. Cette modification sera effective immédiatement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-username" className="text-slate-900 font-semibold">
                Nouveau nom d'utilisateur
              </Label>
              <Input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="text-slate-900"
              />
            </div>

            {usernameStatus && (
              <Alert
                variant={usernameStatus.type === "error" ? "destructive" : "default"}
                className="bg-white border-slate-200"
              >
                {usernameStatus.type === "error" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription className="text-slate-900 font-medium">{usernameStatus.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUsernameDialog(false)}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button onClick={handleUsernameUpdate} disabled={!newUsername.trim() || newUsername === user.username}>
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
