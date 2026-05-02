import Link from "next/link"
import prisma from "@/lib/prisma"
import { searchParticipants } from "@/app/actions/participants.server"
import ParticipantList from "@/components/participant-list"
import { Button } from "@/components/ui/button"
import { Plus } from "@phosphor-icons/react/dist/ssr"

export default async function Page(props: {
  searchParams?: Promise<{ q?: string }>
}) {
  const searchParams = props.searchParams ? await props.searchParams : {}
  const q = searchParams.q ?? undefined

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Participants</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage participants and add walk-ins.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/participants/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Nueva inscripción
          </Link>
        </Button>
      </div>

      <div className="mt-4">
        <ParticipantList participants={participants} q={q} />
      </div>
    </div>
  )
}
