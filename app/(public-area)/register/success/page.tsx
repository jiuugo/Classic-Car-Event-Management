import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:px-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
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
          ¡Inscripción Enviada!
        </h1>

        <p className="mb-8 text-zinc-600">
          Tu solicitud de inscripción ha sido recibida correctamente. Nuestro equipo
          revisará la documentación y te contactará en breve para confirmar tu
          plaza.
        </p>

        <Card>
          <CardContent className="pt-6">
            <p className="mb-2 text-sm text-zinc-500">
              Puedes consultar el estado de tu inscripción en el面板 de control.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
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