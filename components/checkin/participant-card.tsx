"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Envelope, IdentificationCard } from "@phosphor-icons/react"

export function ParticipantCard({
  full_name,
  email,
  national_id,
}: {
  full_name: string
  email: string
  national_id: string
}) {
  const initials = full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-4">
        <Avatar size="lg">
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-base font-medium">
            <User className="size-4 text-muted-foreground" />
            {full_name}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Envelope className="size-4" />
            {email}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <IdentificationCard className="size-4" />
            {national_id}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
