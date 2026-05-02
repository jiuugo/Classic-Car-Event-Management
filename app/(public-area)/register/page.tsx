import { Suspense } from "react"
import InscriptionForm from "@/components/public/InscriptionForm"

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-6 py-12 md:px-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl font-black tracking-tighter md:text-4xl">
          Inscripción
        </h1>
        <p className="text-on-surface-variant text-sm font-medium tracking-[0.2em] uppercase">
          Concentración de Clásicos Villa de la Robla
        </p>
      </div>

      <Suspense fallback={null}>
        <InscriptionForm />
      </Suspense>
    </div>
  )
}
