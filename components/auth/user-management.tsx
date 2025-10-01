"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { useAuth, type User } from "@/lib/auth"
import { Users, Plus, Edit, Trash2, Key, Shield, UserIcon, AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react"

export function UserManagement() {
  const { currentUser, getAllUsers, addUser, updateUser, updatePassword, deleteUser } = useAuth()
  const [users, setUsers] = useState<User[]>(getAllUsers())
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // États pour l'ajout d'utilisateur
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "user" as "admin" | "user",
  })
  const [showNewPassword, setShowNewPassword] = useState(false)

  // États pour l'édition d'utilisateur
  const [editUser, setEditUser] = useState({
    username: "",
    displayName: "",
    role: "user" as "admin" | "user",
  })

  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)

  const refreshUsers = () => {
    setUsers(getAllUsers())
  }

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password || !newUser.displayName) {
      showMessage("error", "Tous les champs sont obligatoires")
      return
    }

    if (newUser.password.length < 8) {
      showMessage("error", "Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    const success = addUser({
      username: newUser.username,
      password: newUser.password,
      displayName: newUser.displayName,
      role: newUser.role,
    })

    if (success) {
      showMessage("success", "Utilisateur ajouté avec succès")
      setNewUser({ username: "", password: "", displayName: "", role: "user" })
      setIsAddDialogOpen(false)
      refreshUsers()
    } else {
      showMessage("error", "Ce nom d'utilisateur existe déjà")
    }
  }

  const handleEditUser = () => {
    if (!selectedUser || !editUser.username || !editUser.displayName) {
      showMessage("error", "Tous les champs sont obligatoires")
      return
    }

    const success = updateUser(selectedUser.id, {
      username: editUser.username,
      displayName: editUser.displayName,
      role: editUser.role,
    })

    if (success) {
      showMessage("success", "Utilisateur modifié avec succès")
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      refreshUsers()
    } else {
      showMessage("error", "Ce nom d'utilisateur existe déjà")
    }
  }

  const handleUpdatePassword = () => {
    if (!selectedUser) return

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      showMessage("error", "Tous les champs sont obligatoires")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "Les mots de passe ne correspondent pas")
      return
    }

    if (passwordData.newPassword.length < 8) {
      showMessage("error", "Le mot de passe doit contenir au moins 8 caractères")
      return
    }

    updatePassword(selectedUser.id, passwordData.newPassword)
    showMessage("success", "Mot de passe modifié avec succès")
    setPasswordData({ newPassword: "", confirmPassword: "" })
    setIsPasswordDialogOpen(false)
    setSelectedUser(null)
    refreshUsers()
  }

  const handleDeleteUser = (user: User) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.displayName}" ?`)) {
      return
    }

    const success = deleteUser(user.id)

    if (success) {
      showMessage("success", "Utilisateur supprimé avec succès")
      refreshUsers()
    } else {
      showMessage("error", "Impossible de supprimer cet utilisateur")
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    })
    setIsEditDialogOpen(true)
  }

  const openPasswordDialog = (user: User) => {
    setSelectedUser(user)
    setPasswordData({ newPassword: "", confirmPassword: "" })
    setIsPasswordDialogOpen(true)
  }

  const canDeleteUser = (user: User) => {
    const admins = users.filter((u) => u.role === "admin")
    return user.id !== currentUser?.id && !(user.role === "admin" && admins.length === 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des utilisateurs</h2>
          <p className="text-slate-600">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
              <DialogDescription>Créez un nouveau compte utilisateur avec ses permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Nom d'utilisateur</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="Nom d'utilisateur unique"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-displayname">Nom d'affichage</Label>
                <Input
                  id="new-displayname"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  placeholder="Nom complet de l'utilisateur"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Minimum 8 caractères"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-role">Rôle</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: "admin" | "user") => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4" />
                        <span>Utilisateur</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4" />
                        <span>Administrateur</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddUser}>Ajouter</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          {message.type === "error" ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Utilisateurs ({users.length})</span>
          </CardTitle>
          <CardDescription>Liste de tous les utilisateurs du système</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.displayName}</div>
                        <div className="text-sm text-slate-500">@{user.username}</div>
                        {user.id === currentUser?.id && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Vous
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? (
                        <div className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>Admin</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-3 w-3" />
                          <span>Utilisateur</span>
                        </div>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <span className="text-sm text-slate-600">
                        {new Date(user.lastLogin).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Jamais</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openPasswordDialog(user)}>
                        <Key className="h-4 w-4" />
                      </Button>
                      {canDeleteUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>Modifiez les informations de l'utilisateur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Nom d'utilisateur</Label>
              <Input
                id="edit-username"
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-displayname">Nom d'affichage</Label>
              <Input
                id="edit-displayname"
                value={editUser.displayName}
                onChange={(e) => setEditUser({ ...editUser, displayName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                value={editUser.role}
                onValueChange={(value: "admin" | "user") => setEditUser({ ...editUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4" />
                      <span>Utilisateur</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Administrateur</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEditUser}>Modifier</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de changement de mot de passe */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
            <DialogDescription>Définissez un nouveau mot de passe pour cet utilisateur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password-field">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password-field"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimum 8 caractères"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Répétez le mot de passe"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdatePassword}>Changer le mot de passe</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
