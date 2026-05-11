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
import { createDashboardUser } from "@/app/actions/dashboard-users.server"

export default function DashboardUserCreateForm({
  onClose,
}: {
  onClose?: () => void
}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"ADMIN" | "STAFF">("STAFF")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    startTransition(async () => {
      try {
        const result = await createDashboardUser({
          email,
          password,
          confirm_password: confirmPassword,
          role,
        })

        if (!result.success) {
          toast.error(result.error ?? "Error al crear el usuario")
          return
        }

        toast.success("Usuario creado correctamente")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setRole("STAFF")
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
        <Label htmlFor="create-email">Email</Label>
        <Input
          id="create-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@ejemplo.com"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="create-password">Contraseña</Label>
        <Input
          id="create-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="create-confirm-password">Confirmar contraseña</Label>
        <Input
          id="create-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repetir contraseña"
          minLength={6}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="create-role">Rol</Label>
        <Select
          value={role}
          onValueChange={(v) => setRole(v as "ADMIN" | "STAFF")}
        >
          <SelectTrigger id="create-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="ADMIN">Administrador</SelectItem>
              <SelectItem value="STAFF">Personal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creando…" : "Crear usuario"}
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
