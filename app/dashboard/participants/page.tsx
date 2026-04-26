import prisma from "@/lib/prisma"
import { createParticipant } from "@/app/actions/participants.server"

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
        <form action={createParticipant} className="rounded-md border p-4">
          <h3 className="font-medium">Create Participant (Walk-in)</h3>
          <div className="mt-2 grid gap-2">
            <input
              name="full_name"
              required
              placeholder="Full name"
              className="h-10 rounded-md border px-3"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="h-10 rounded-md border px-3"
            />
            <input
              name="national_id"
              required
              placeholder="National ID"
              className="h-10 rounded-md border px-3"
            />
            <button
              type="submit"
              className="mt-2 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm text-white"
            >
              Create
            </button>
          </div>
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
