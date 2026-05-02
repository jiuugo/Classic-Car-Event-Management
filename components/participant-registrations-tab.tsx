"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  ReceiptIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CarIcon,
  CreditCardIcon,
} from "@phosphor-icons/react"
import type {
  ParticipantRegistration,
  ParticipantRegistrationItem,
  ParticipantPayment,
} from "@/lib/types/participant.types"

const statusConfig: Record<
  string,
  {
    label: string
    variant: "default" | "outline" | "destructive" | "secondary"
    icon: React.ReactNode
  }
> = {
  PENDING: {
    label: "Pending",
    variant: "outline",
    icon: <ClockIcon className="size-3" />,
  },
  PAID: {
    label: "Paid",
    variant: "default",
    icon: <CheckCircleIcon className="size-3" />,
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive",
    icon: <XCircleIcon className="size-3" />,
  },
}

const paymentStatusConfig: Record<
  string,
  { label: string; variant: "default" | "destructive" }
> = {
  COMPLETED: { label: "Completed", variant: "default" },
  FAILED: { label: "Failed", variant: "destructive" },
}

export default function ParticipantRegistrationsTab({
  registrations,
}: {
  registrations: ParticipantRegistration[]
}) {
  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center">
        <ReceiptIcon className="size-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          No registrations found for this participant.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {registrations.map((reg) => {
        const config = statusConfig[reg.status] ?? statusConfig.PENDING

        return (
          <Card key={reg.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <ReceiptIcon className="size-4 text-muted-foreground" />
                  Registration
                </CardTitle>
                <Badge variant={config.variant} className="gap-1">
                  {config.icon}
                  {config.label}
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {reg.id}
              </p>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {/* Registration Items */}
              {reg.items.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Vehicles in this registration
                  </p>
                  <div className="space-y-2">
                    {reg.items.map((item) => (
                      <RegistrationItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* Payments */}
              {reg.payments.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Payments
                    </p>
                    <div className="space-y-2">
                      {reg.payments.map((payment) => (
                        <PaymentRow key={payment.id} payment={payment} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {reg.payments.length === 0 && (
                <>
                  <Separator />
                  <p className="text-xs text-muted-foreground italic">
                    No payments recorded for this registration.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function RegistrationItemRow({ item }: { item: ParticipantRegistrationItem }) {
  const isCheckedIn = !!item.checkin_date

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
      <CarIcon
        className="size-4 shrink-0 text-muted-foreground"
        weight="duotone"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {item.vehicle.brand} {item.vehicle.model}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <code className="font-mono">{item.vehicle.license_plate}</code>
          {item.entry_number != null && <span>· Bib #{item.entry_number}</span>}
        </div>
      </div>
      <Badge
        variant={isCheckedIn ? "default" : "outline"}
        className="shrink-0 text-[10px]"
      >
        {isCheckedIn ? "Present" : "Absent"}
      </Badge>
    </div>
  )
}

function PaymentRow({ payment }: { payment: ParticipantPayment }) {
  const config =
    paymentStatusConfig[payment.status] ?? paymentStatusConfig.COMPLETED

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2">
      <CreditCardIcon
        className="size-4 shrink-0 text-muted-foreground"
        weight="duotone"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">
          {Number(payment.amount).toFixed(2)} €
        </p>
        <p className="text-xs text-muted-foreground">via {payment.provider}</p>
      </div>
      <Badge variant={config.variant} className="shrink-0 text-[10px]">
        {config.label}
      </Badge>
    </div>
  )
}
