"use client"

import React, { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ParticipantEditForm({
  participant,
  onClose,
}: {
  participant: any
  onClose?: () => void
}) {
  const [fullName, setFullName] = useState(participant?.full_name ?? "")
  const [email, setEmail] = useState(participant?.email ?? "")
  const [nationalId, setNationalId] = useState(participant?.national_id ?? "")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const res = await fetch(`/api/participants/${participant.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,
            email,
            national_id: nationalId,
          }),
        })

        const json = await res.json().catch(() => null)

        if (!res.ok) {
          toast.error(json?.error ?? "Failed to update participant")
          return
        }

        toast.success("Participant updated")
        if (onClose) onClose()
        router.refresh()
      } catch (err) {
        toast.error(String(err))
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <Label>Full name</Label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>

      <div>
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div>
        <Label>National ID</Label>
        <Input value={nationalId} onChange={(e) => setNationalId(e.target.value)} required />
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" disabled={isPending}>
          Save
        </Button>
        <Button variant="ghost" type="button" onClick={() => onClose && onClose()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
