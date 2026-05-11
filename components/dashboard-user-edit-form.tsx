"use client"

import React, { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateDashboardUser } from "@/app/actions/dashboard-users.server"
import type { DashboardUserRow } from "@/lib/types/dashboard-user.types"

export default function DashboardUserEditForm({
  user,
  currentUserId,
  onClose,
}: {
  user: DashboardUserRow
  currentUserId: string
  onClose?: () => void
}) {
  const [email, setEmail] = useState(user.email)
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"ADMIN" | "STAFF">(user.role)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const isSelf = user.id === currentUserId

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const payload: {
          email?: string
          password?: string
          role?: "ADMIN" | "STAFF"
        } = {}

        if (email !== user.email) payload.email = email
        if (password.length > 0) payload.password = password
        if (role !== user.role) payload.role = role

        if (Object.keys(payload).length === 0) {
          toast.info("No se han realizado cambios")
          if (onClose) onClose()
          return
        }

        const result = await updateDashboardUser(user.id, payload)

        if (!result.success) {
          toast.error(result.error ?? "Error al actualizar el usuario")
          return
        }

        toast.success("Usuario actualizado")
        if (onClose) onClose()
        router.refresh()
      } catch (err) {
        toast.error(String(err))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-password">Nueva contraseña</Label>
        <Input
          id="edit-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Dejar vacío para no cambiar"
          minLength={6}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-role">Rol</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as "ADMIN" | "STAFF")}
          disabled={isSelf}
        >
          <SelectTrigger id="edit-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="STAFF">Personal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {isSelf && (
          <p className="text-xs text-muted-foreground">
            No puedes cambiar tu propio rol.
          </p>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={() => onClose && onClose()}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
