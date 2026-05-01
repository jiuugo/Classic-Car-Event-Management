"use client"

import React, { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import type { RegistrationDetail } from "@/lib/types/registration.types"
import {
  markRegistrationAsPaid,
  cancelRegistration,
  updateRegistrationStatus,
} from "@/app/actions/registrations.server"
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ReceiptIcon,
  CarIcon,
  CreditCardIcon,
  UserIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react"

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

export default function RegistrationDetail({
  registration,
}: {
  registration: RegistrationDetail
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [amount, setAmount] = useState("")

  const status = statusConfig[registration.status]

  function handleCancel() {
    if (!confirm("Are you sure you want to cancel this registration?")) return
    startTransition(async () => {
      const result = await cancelRegistration(registration.id)
      if (result.success) {
        toast.success("Registration cancelled")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to cancel")
      }
    })
  }

  function handleReopen() {
    if (!confirm("Reopen this registration?")) return
    startTransition(async () => {
      const result = await updateRegistrationStatus(registration.id, "PENDING")
      if (result.success) {
        toast.success("Registration reopened")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to reopen")
      }
    })
  }

  function handleMarkPaid(e: React.FormEvent) {
    e.preventDefault()
    const val = Number(amount)
    if (!amount || isNaN(val) || val <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    startTransition(async () => {
      const result = await markRegistrationAsPaid(registration.id, val)
      if (result.success) {
        toast.success("Registration marked as paid")
        setMarkPaidOpen(false)
        setAmount("")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to update")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-8 lg:px-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" className="w-fit" asChild>
        <Link href="/dashboard/registrations">
          <ArrowLeftIcon className="size-4 mr-1" />
          Back to registrations
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <ReceiptIcon className="size-6 text-muted-foreground" weight="duotone" />
          <h2 className="text-xl font-semibold">Registration Detail</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {registration.id}
          </code>
          <Badge variant={status.variant} className="gap-1">
            {status.icon}
            {status.label}
          </Badge>
          <span>
            Created {new Date(registration.createdAt).toLocaleDateString("es-ES")}
          </span>
        </div>
        {registration.stripe_session_id && (
          <p className="text-xs text-muted-foreground">
            Stripe Session: <code className="font-mono">{registration.stripe_session_id}</code>
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left column: Participant + Actions */}
        <div className="flex flex-col gap-4">
          {/* Participant Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <UserIcon className="size-4 text-muted-foreground" />
                Participant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link
                href={`/dashboard/participants/${registration.participant.id}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {registration.participant.full_name}
              </Link>
              <div className="text-sm text-muted-foreground">
                {registration.participant.email}
              </div>
              <code className="w-fit rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                {registration.participant.national_id}
              </code>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {registration.status === "PENDING" && (
                <>
                  <Sheet open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
                    <SheetTrigger asChild>
                      <Button variant="default" size="sm" disabled={isPending}>
                        <CheckCircleIcon className="size-4 mr-1" />
                        Mark as Paid
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>Mark as Paid</SheetTitle>
                        <SheetDescription>
                          Enter the payment amount to confirm this registration.
                        </SheetDescription>
                      </SheetHeader>
                      <form onSubmit={handleMarkPaid} className="mt-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="amount">Amount (€)</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={isPending}>
                          Confirm Payment
                        </Button>
                      </form>
                    </SheetContent>
                  </Sheet>

                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isPending}
                    onClick={handleCancel}
                  >
                    <XCircleIcon className="size-4 mr-1" />
                    Cancel Registration
                  </Button>
                </>
              )}

              {registration.status === "CANCELLED" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={handleReopen}
                >
                  <ClockIcon className="size-4 mr-1" />
                  Reopen Registration
                </Button>
              )}

              {registration.status === "PAID" && (
                <p className="text-xs text-muted-foreground italic">
                  No actions available for paid registrations.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Vehicles + Payments */}
        <div className="flex flex-col gap-4">
          {/* Vehicles / Tickets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CarIcon className="size-4 text-muted-foreground" />
                Vehicles ({registration.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {registration.items.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No vehicles in this registration.
                </p>
              ) : (
                registration.items.map((item) => {
                  const checkedIn = !!item.checkin_date
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <CarIcon
                        className="size-4 shrink-0 text-muted-foreground"
                        weight="duotone"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {item.vehicle.brand} {item.vehicle.model}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <code className="font-mono">
                            {item.vehicle.license_plate}
                          </code>
                          {item.entry_number != null && (
                            <span>· Bib #{item.entry_number}</span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={checkedIn ? "default" : "outline"}
                        className="shrink-0 text-[10px]"
                      >
                        {checkedIn ? "Present" : "Absent"}
                      </Badge>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <CreditCardIcon className="size-4 text-muted-foreground" />
                Payments ({registration.payments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {registration.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No payments recorded.
                </p>
              ) : (
                registration.payments.map((payment) => {
                  const config =
                    paymentStatusConfig[payment.status] ??
                    paymentStatusConfig.COMPLETED
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                    >
                      <CreditCardIcon
                        className="size-4 shrink-0 text-muted-foreground"
                        weight="duotone"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {Number(payment.amount).toFixed(2)} €
                        </p>
                        <p className="text-xs text-muted-foreground">
                          via {payment.provider}
                        </p>
                      </div>
                      <Badge
                        variant={config.variant}
                        className="shrink-0 text-[10px]"
                      >
                        {config.label}
                      </Badge>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
