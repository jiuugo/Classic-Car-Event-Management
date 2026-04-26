"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ParticipantRowActions({ participantId }: { participantId: string }) {
  const handleDelete = async () => {
    if (!confirm("Delete this participant?")) return

    try {
      const res = await fetch(`/api/participants/${participantId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const json = await res.json().catch(() => null)
        toast.error(json?.error ?? "Failed to delete")
        return
      }

      toast.success("Participant deleted")
      window.location.reload()
    } catch (err) {
      toast.error(String(err))
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" asChild>
        <a href="#">View</a>
      </Button>
      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}
