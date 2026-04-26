import prisma from "@/lib/prisma"
import { createParticipant } from "@/app/actions/participants.server"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function Page() {
  const participants = await prisma.participant.findMany({
    take: 50,
    orderBy: { full_name: "asc" },
  })

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Participants</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage participants and add walk-ins.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form action={createParticipant}>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Create Participant (Walk-in)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2 grid gap-2">
                <Input name="full_name" required placeholder="Full name" />
                <Input name="email" type="email" required placeholder="Email" />
                <Input name="national_id" required placeholder="National ID" />
                <div className="mt-2">
                  <Button type="submit">Create</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="rounded-md border p-4">
          <h3 className="font-medium">Existing participants</h3>
          <ul className="mt-2 space-y-2">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.full_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.email} · {p.national_id}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
