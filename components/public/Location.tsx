import React from 'react'

export default function Location(): JSX.Element {
  return (
    <section className="relative py-12 bg-white" id="ubicacion">
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <span className="text-surface-tint font-bold text-xs uppercase tracking-[0.3em]">El Destino</span>
          <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter leading-none">Villa de la Robla, <span className="italic text-zinc-400">León.</span></h2>
          <p className="text-on-surface-variant text-lg">El punto de encuentro será la Plaza de la Constitución, un marco incomparable para lucir la ingeniería clásica.</p>

          <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-3xl text-surface-tint">location_on</span>
            <div>
              <p className="font-bold uppercase text-xs tracking-tight">Coordenadas del Evento</p>
              <p className="text-sm text-zinc-500">42°51′00″N 5°37′00″O</p>
            </div>
          </div>

          <button className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all">Cómo Llegar</button>
        </div>

        <div className="relative h-[350px] w-full bg-surface-container rounded-xl overflow-hidden shadow-2xl border-4 border-white">
          <img alt="Location Visual" className="w-full h-full object-cover grayscale" src="/images/location.svg" />
          <div className="absolute top-1/2 left-1/2 -translate-x-12 -translate-y-12 w-24 h-24 bg-surface-tint/20 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 bg-surface-tint rounded-full ring-4 ring-white"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
