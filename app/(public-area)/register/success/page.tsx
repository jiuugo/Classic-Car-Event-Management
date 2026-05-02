import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import stripe from "@/lib/stripe"
import { reconcileBySessionId } from "@/app/actions/inscription.server"

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams
  let vehicleCount = 0
  let totalPaid = ""
  let email = ""

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      vehicleCount = Number(
        session.metadata?.vehicles
          ? JSON.parse(session.metadata.vehicles).length
          : 0
      )
      totalPaid = ((session.amount_total ?? 0) / 100).toFixed(2)
      email = session.customer_email ?? session.metadata?.email ?? ""

      // Safety net: if the webhook failed (DB was down, network error, etc.),
      // reconcile the payment status right here. This is idempotent — if the
      // webhook already confirmed it, this is a no-op.
      if (session.payment_status === "paid") {
        const amountEur = (session.amount_total ?? 0) / 100
        await reconcileBySessionId(session.id, amountEur)
      }
    } catch {
      // session not found — gracefully degrade
    }
  }

  return (
    <div className="container mx-auto px-6 py-12 md:px-12">
      <div className="mx-auto max-w-lg text-center">
        {/* Animated check */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 animate-in items-center justify-center rounded-full bg-green-100 duration-500 zoom-in">
            <svg
              className="h-10 w-10 animate-in text-green-600 duration-700 fade-in"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-4 font-serif text-3xl font-black tracking-tighter md:text-4xl">
          ¡Inscripción Completada!
        </h1>

        <p className="mb-8 text-zinc-600">
          Tu pago se ha procesado correctamente y tu inscripción ha sido
          confirmada. Recibirás un email de confirmación en breve.
        </p>

        {(vehicleCount > 0 || totalPaid) && (
          <Card className="mb-8">
            <CardContent className="grid gap-3 pt-6 text-sm">
              {email && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{email}</span>
                </div>
              )}
              {vehicleCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Vehículos inscritos
                  </span>
                  <span className="font-semibold">{vehicleCount}</span>
                </div>
              )}
              {totalPaid && (
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-medium">Total pagado</span>
                  <span className="text-lg font-black text-primary">
                    {totalPaid} €
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-zinc-500">
              Puedes consultar el estado de tu inscripción desde el panel de
              control o usando tu código QR el día del evento.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/checkin">Consultar mi inscripción</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
