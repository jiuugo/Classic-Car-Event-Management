"use client"

import React, { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

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
      toast.error("Please complete all fields.")
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/participants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: fullName,
            email,
            national_id: nationalId,
          }),
        })

        if (!res.ok) {
          const json = await res.json().catch(() => null)
          toast.error(json?.error ?? "Failed to create participant")
          return
        }

        toast.success("Participant created")
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
        <CardTitle>Create Participant (Walk-in)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <div>
            <Label>Full name</Label>
            <Input
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Full name"
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
            <Label>National ID</Label>
            <Input
              name="national_id"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
              placeholder="National ID"
            />
          </div>

          <div className="mt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
