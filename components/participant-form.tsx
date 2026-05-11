"use client"

import React, { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { createParticipant } from "@/app/actions/participants.server"

export default function ParticipantForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !nationalId.trim()) {
      toast.error("Completa todos los campos.")
      return
    }

    startTransition(async () => {
      try {
        const result = await createParticipant({
          full_name: fullName,
          email,
          national_id: nationalId,
        })

        if (!result.success) {
          toast.error(result.error ?? "Error al crear el participante")
          return
        }

        toast.success("Participante creado")
        setFullName("")
        setEmail("")
        setNationalId("")
        if (onSuccess) onSuccess()
      } catch (err) {
        toast.error(String(err))
      }
    })
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Crear Participante (Presencial)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div>
            <Label>Nombre completo</Label>
            <Input
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
            />
          </div>

          <div>
            <Label>DNI/NIE</Label>
            <Input
              name="national_id"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              placeholder="DNI/NIE"
            />
          </div>

          <div className="mt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
