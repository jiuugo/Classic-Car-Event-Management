import prisma from "@/lib/prisma"
import { searchParticipants } from "@/app/actions/participants.server"
import ParticipantForm from "@/components/participant-form"
import ParticipantList from "@/components/participant-list"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default async function Page({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const q = searchParams?.q ?? undefined

  let participants: any[] = []

  if (q) {
    const res = await searchParticipants(q)
    participants = res?.success ? (res.data ?? []) : []
  } else {
    participants = await prisma.participant.findMany({
      take: 50,
      orderBy: { full_name: "asc" },
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Participants</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage participants and add walk-ins.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <ParticipantForm />
        <ParticipantList participants={participants} q={q} />
      </div>
    </div>
  )
}
