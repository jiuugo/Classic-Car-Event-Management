"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import ParticipantEditForm from "./participant-edit-form"
import ParticipantCarsSheet from "./participant-cars-sheet"

export default function ParticipantRowActions({
  participant,
}: {
  participant: any
}) {
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Delete this participant?")) return

    try {
      const res = await fetch(`/api/participants/${participant.id}`, {
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
    <div className="flex items-center gap-2">
      <ParticipantCarsSheet participantId={participant.id} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit participant</SheetTitle>
            <SheetDescription>
              Update participant information below.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6">
            <ParticipantEditForm
              participant={participant}
              onClose={() => setOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Button variant="destructive" size="sm" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  )
}
