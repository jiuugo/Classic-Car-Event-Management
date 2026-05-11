"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
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

  return (
    <div className="flex items-center gap-2">
      <ParticipantCarsSheet participantId={participant.id} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            Editar
          </Button>
        </SheetTrigger>

        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Editar participante</SheetTitle>
            <SheetDescription>
              Actualiza los datos del participante.
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
    </div>
  )
}
