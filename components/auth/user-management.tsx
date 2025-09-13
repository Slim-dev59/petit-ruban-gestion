"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Edit, Trash2, Shield, User, AlertTriangle, CheckCircle, Key, Calendar, Clock } from "lucide-react"
import { useAuth } from "@/lib/auth"

export function UserManagement() {
  const { users, currentUser, addUser, updateUser, deleteUser } = useAuth()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    role: "user" as "admin" | "user",
    password: "",
  })
  const [newPassword, setNewPassword] = useState("")
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleAddUser = () => {
    if (!formData.username || !formData.name || !formData.password) {
      setStatus({ type: "error", message: "Tous les champs sont requis" })
      return
    }

    if (formData.password.length < 8) {
      setStatus({ type: "error", message: "Le mot de passe doit contenir au moins 8 caractères" })
      return
    }

    if (users.some((u) => u.username === formData.username)) {
      setStatus({ type: "error", message: "Ce nom d'utilisateur existe déjà" })
      return
    }

    const success = addUser(formData.username, formData.password, formData.name, formData.role)
    if (success) {
      setStatus({ type: "success", message: "Utilisateur créé avec succès" })
      setFormData({ username: "", name: "", role: "user", password: "" })
      setIsAddDialogOpen(false)
    } else {
      setStatus({ type: "error", message: "Erreur lors de la création de l'utilisateur" })
    }

    setTimeout(() => setStatus(null), 3000)
  }

  const handleEditUser = () => {
    if (!selectedUser || !formData.name) {
      setStatus({ type: "error", message: "Le nom est requis" })
      return
    }

    const success = updateUser(selectedUser.id, { name: formData.name, role: formData.role })
    if (success) {
      setStatus({ type: "success", message: "Utilisateur modifié avec succès" })
      setIsEditDialogOpen(false)
      setSelectedUser(null)
    } else {
      setStatus({ type: "error", message: "Erreur lors de la modification" })
    }

    setTimeout(() => setStatus(null), 3000)
  }

  const handleChangePassword = () => {
    if (!selectedUser || !newPassword) {
      setStatus({ type: "error", message: "Le nouveau mot de passe est requis" })
      return
    }

    if (newPassword.length < 8) {
      setStatus({ type: "error", message: "Le mot de passe doit contenir au moins 8 caractères" })
      return
    }

    const success = updateUser(selectedUser.id, { password: newPassword })
    if (success) {
      setStatus({ type: "success", message: "Mot de passe modifié avec succès" })
      setIsPasswordDialogOpen(false)
      setSelectedUser(null)
      setNewPassword("")
    } else {
      setStatus({ type: "error", message: "Erreur lors de la modification du mot de passe" })
    }

    setTimeout(() => setStatus(null), 3000)
  }

  const handleDeleteUser = (user: any) => {
    if (user.id === currentUser?.id) {
      setStatus({ type: "error", message: "Vous ne pouvez pas supprimer votre propre compte" })
      setTimeout(() => setStatus(null), 3000)
      return
    }

    const adminUsers = users.filter((u) => u.role === "admin")
    if (user.role === "admin" && adminUsers.length <= 1) {
      setStatus({ type: "error", message: "Impossible de supprimer le dernier administrateur" })
      setTimeout(() => setStatus(null), 3000)
      return
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
      const success = deleteUser(user.id)
      if (success) {
        setStatus({ type: "success", message: "Utilisateur supprimé avec succès" })
      } else {
        setStatus({ type: "error", message: "Erreur lors de la suppression" })
      }
      setTimeout(() => setStatus(null), 3000)
    }
  }

  const openEditDialog = (user: any) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      name: user.name,
      role: user.role,
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  const openPasswordDialog = (user: any) => {
    setSelectedUser(user)
    setNewPassword("")
    setIsPasswordDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6 text-force-black">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-black">
                <Users className="h-5 w-5" />
                Gestion des utilisateurs
              </CardTitle>
              <CardDescription className="text-slate-600">
                Gérez les comptes utilisateurs et leurs permissions
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvel utilisateur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-black">Créer un nouvel utilisateur</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Ajoutez un nouveau compte utilisateur à l'application
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-username" className="text-black">
                      Nom d'utilisateur
                    </Label>
                    <Input
                      id="new-username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="nom.utilisateur"
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-name" className="text-black">
                      Nom complet
                    </Label>
                    <Input
                      id="new-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Jean Dupont"
                      className="text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-role" className="text-black">
                      Rôle
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="text-black">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Utilisateur</SelectItem>
                        <SelectItem value="admin">Administrateur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-black">
                      Mot de passe
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 8 caractères"
                      className="text-black"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="text-black">
                      Annuler
                    </Button>
                    <Button onClick={handleAddUser}>Créer l'utilisateur</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status && (
              <Alert variant={status.type === "error" ? "destructive" : "default"}>
                {status.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <AlertDescription className="text-black">{status.message}</AlertDescription>
              </Alert>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">Utilisateur</TableHead>
                    <TableHead className="text-black">Rôle</TableHead>
                    <TableHead className="text-black">Dernière connexion</TableHead>
                    <TableHead className="text-black">Créé le</TableHead>
                    <TableHead className="text-right text-black">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-black">{user.name}</p>
                            <p className="text-sm text-slate-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-black">
                          {user.role === "admin" ? (
                            <>
                              <Shield className="h-3 w-3 mr-1" />
                              Administrateur
                            </>
                          ) : (
                            <>
                              <User className="h-3 w-3 mr-1" />
                              Utilisateur
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4" />
                          {user.lastLogin ? formatDate(user.lastLogin) : "Jamais"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)} className="text-black">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPasswordDialog(user)}
                            className="text-black"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={
                              user.id === currentUser?.id ||
                              (user.role === "admin" && users.filter((u) => u.role === "admin").length <= 1)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                {users.length} utilisateur{users.length > 1 ? "s" : ""} au total
              </span>
              <span>
                {users.filter((u) => u.role === "admin").length} administrateur
                {users.filter((u) => u.role === "admin").length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Modifier l'utilisateur</DialogTitle>
            <DialogDescription className="text-slate-600">Modifiez les informations de l'utilisateur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-black">
                Nom complet
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="text-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-black">
                Rôle
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="text-black">
                Annuler
              </Button>
              <Button onClick={handleEditUser}>Sauvegarder</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de changement de mot de passe */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Changer le mot de passe</DialogTitle>
            <DialogDescription className="text-slate-600">
              Définissez un nouveau mot de passe pour {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password-change" className="text-black">
                Nouveau mot de passe
              </Label>
              <Input
                id="new-password-change"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                className="text-black"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} className="text-black">
                Annuler
              </Button>
              <Button onClick={handleChangePassword}>Changer le mot de passe</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
