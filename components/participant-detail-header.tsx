"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import {
  PencilSimpleIcon,
  EnvelopeIcon,
  CopyIcon,
  ArrowLeftIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react"
import { resendConfirmationEmail } from "@/app/actions/inscription.server"
import ParticipantEditForm from "./participant-edit-form"
import type { ParticipantDetail } from "@/lib/types/participant.types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default function ParticipantDetailHeader({
  participant,
}: {
  participant: ParticipantDetail
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [resending, setResending] = useState(false)

  const handleCopyToken = async () => {
    try {
      await navigator.clipboard.writeText(participant.qr_token)
      toast.success("Token QR copiado al portapapeles")
    } catch {
      toast.error("Error al copiar el token")
    }
  }

  const hasPaidRegistration = participant.registrations.some(
    (r) => r.status === "PAID"
  )

  const handleResendQr = async () => {
    setResending(true)
    try {
      const result = await resendConfirmationEmail(participant.id)
      if (result.success) {
        toast.success("Email de confirmación reenviado")
      } else {
        toast.error(result.error ?? "Error al reenviar el email")
      }
    } catch {
      toast.error("Error inesperado al reenviar el email")
    } finally {
      setResending(false)
    }
  }

  const vehicleCount = participant.vehicles.length
  const registrationCount = participant.registrations.length
  const checkedInCount = participant.registrations.reduce(
    (acc, reg) =>
      acc + reg.items.filter((item) => item.checkin_date != null).length,
    0
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit gap-1.5 text-muted-foreground"
        onClick={() => router.push("/dashboard/participants")}
      >
        <ArrowLeftIcon className="size-4" />
        Volver a Participantes
      </Button>

      {/* Identity Card */}
      <div className="flex flex-col gap-6 rounded-xl border bg-card p-6 shadow-sm">
        {/* Top row: avatar + name + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar size="lg" className="size-14">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {getInitials(participant.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {participant.full_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {participant.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Edit */}
            <Sheet open={editOpen} onOpenChange={setEditOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <PencilSimpleIcon className="size-4" />
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
                    onClose={() => {
                      setEditOpen(false)
                      router.refresh()
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Resend QR */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!hasPaidRegistration || resending}
              title={
                hasPaidRegistration
                  ? "Reenviar email de confirmación con QR"
                  : "No hay inscripciones pagadas"
              }
              onClick={handleResendQr}
            >
              {resending ? (
                <SpinnerGapIcon className="size-4 animate-spin" />
              ) : (
                <EnvelopeIcon className="size-4" />
              )}
              {resending ? "Enviando…" : "Reenviar QR"}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Detail fields */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              DNI/NIE
            </p>
            <p className="mt-1 text-sm font-medium">
              {participant.national_id}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Vehículos
            </p>
            <p className="mt-1 text-sm font-medium">{vehicleCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Inscripciones
            </p>
            <p className="mt-1 text-sm font-medium">{registrationCount}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Vehículos Registrados
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm font-medium">{checkedInCount}</p>
              {checkedInCount > 0 && (
                <Badge variant="default" className="text-[10px]">
                  Presente
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* QR Token */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Token QR
            </p>
            <code className="mt-1 block rounded bg-muted px-2 py-1 font-mono text-xs break-all">
              {participant.qr_token}
            </code>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={handleCopyToken}
          >
            <CopyIcon className="size-4" />
            Copiar
          </Button>
        </div>
      </div>
    </div>
  )
}
