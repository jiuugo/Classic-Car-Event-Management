import React from "react"

export default function Participate() {
  return (
    <section className="bg-surface-container-low py-12" id="participar">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-serif text-3xl font-black tracking-tighter md:text-4xl">
            Proceso de Inscripción
          </h2>
          <p className="text-on-surface-variant text-xs font-bold tracking-[0.2em] uppercase">
            Cuatro pasos para asegurar tu plaza
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="border-surface-tint rounded-sm border-t-4 bg-white p-6 text-center shadow-sm">
            <span className="mb-2 block font-serif text-4xl font-bold text-zinc-200 italic">
              01
            </span>
            <h5 className="mb-2 font-bold tracking-tight uppercase">
              Formulario
            </h5>
            <p className="text-on-surface-variant text-sm">
              Completa los datos de tu vehículo y contacto.
            </p>
          </div>

          <div className="rounded-sm border-t-4 border-primary bg-white p-6 text-center shadow-sm">
            <span className="mb-2 block font-serif text-4xl font-bold text-zinc-200 italic">
              02
            </span>
            <h5 className="mb-2 font-bold tracking-tight uppercase">
              Documentación
            </h5>
            <p className="text-on-surface-variant text-sm">
              Adjunta fotos y ficha técnica actualizada.
            </p>
          </div>

          <div className="border-surface-tint rounded-sm border-t-4 bg-white p-6 text-center shadow-sm">
            <span className="mb-2 block font-serif text-4xl font-bold text-zinc-200 italic">
              03
            </span>
            <h5 className="mb-2 font-bold tracking-tight uppercase">
              Confirmación
            </h5>
            <p className="text-on-surface-variant text-sm">
              Nuestro comité técnico validará tu entrada.
            </p>
          </div>

          <div className="rounded-sm border-t-4 border-primary bg-white p-6 text-center shadow-sm">
            <span className="mb-2 block font-serif text-4xl font-bold text-zinc-200 italic">
              04
            </span>
            <h5 className="mb-2 font-bold tracking-tight uppercase">Pago</h5>
            <p className="text-on-surface-variant text-sm">
              Abona la cuota para finalizar el registro.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="/register"
            className="hover:bg-surface-tint rounded-sm bg-primary px-12 py-4 text-sm font-black tracking-widest text-white uppercase shadow-2xl transition-colors"
          >
            Comenzar Inscripción Ahora
          </a>
        </div>
      </div>
    </section>
  )
}
