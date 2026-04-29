import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CancelPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:px-12">
      <div className="mx-auto max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-10 w-10 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-4 font-serif text-3xl font-black tracking-tighter md:text-4xl">
          Pago Cancelado
        </h1>

        <p className="mb-8 text-zinc-600">
          No se ha realizado ningún cargo. Tus datos de inscripción se han
          conservado — puedes volver al formulario e intentarlo de nuevo.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/register">Volver al formulario</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
