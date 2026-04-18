import React from 'react'

export default function Participate(): JSX.Element {
  return (
    <section className="py-12 bg-surface-container-low" id="participar">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter mb-2">Proceso de Inscripción</h2>
          <p className="text-on-surface-variant uppercase text-xs tracking-[0.2em] font-bold">Cuatro pasos para asegurar tu plaza</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-surface-tint text-center">
            <span className="text-4xl font-serif italic font-bold text-zinc-200 mb-2 block">01</span>
            <h5 className="font-bold uppercase tracking-tight mb-2">Formulario</h5>
            <p className="text-sm text-on-surface-variant">Completa los datos de tu vehículo y contacto.</p>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-primary text-center">
            <span className="text-4xl font-serif italic font-bold text-zinc-200 mb-2 block">02</span>
            <h5 className="font-bold uppercase tracking-tight mb-2">Documentación</h5>
            <p className="text-sm text-on-surface-variant">Adjunta fotos y ficha técnica actualizada.</p>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-surface-tint text-center">
            <span className="text-4xl font-serif italic font-bold text-zinc-200 mb-2 block">03</span>
            <h5 className="font-bold uppercase tracking-tight mb-2">Confirmación</h5>
            <p className="text-sm text-on-surface-variant">Nuestro comité técnico validará tu entrada.</p>
          </div>

          <div className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-primary text-center">
            <span className="text-4xl font-serif italic font-bold text-zinc-200 mb-2 block">04</span>
            <h5 className="font-bold uppercase tracking-tight mb-2">Pago</h5>
            <p className="text-sm text-on-surface-variant">Abona la cuota para finalizar el registro.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <a href="/register" className="bg-primary text-white px-12 py-4 rounded-sm font-black uppercase tracking-widest text-sm hover:bg-surface-tint transition-colors shadow-2xl">Comenzar Inscripción Ahora</a>
        </div>
      </div>
    </section>
  )
}
