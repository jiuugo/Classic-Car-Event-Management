import React from 'react'
import { Button } from '@/components/ui/button'

export default function Hero(): JSX.Element {
  return (
    <section className="relative min-h-svh flex items-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
        <img alt="Hero Image" className="w-full h-full object-cover" src="/images/hero.svg" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12">
        <div className="space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-surface-tint text-white px-3 py-1 rounded-sm text-[10px] font-bold tracking-[0.2em] uppercase">
            Próxima Edición 2026
          </div>

          <h1 className="text-white font-serif text-4xl md:text-6xl font-extrabold leading-[0.9] tracking-tighter">
            II Concentración de coches clásicos
            <br />
            <span className="italic text-surface-tint">Villa de la Robla</span>
          </h1>

          <p className="text-zinc-300 text-lg md:text-xl max-w-md font-light leading-relaxed">
            Un homenaje a la ingeniería clásica y el legado automovilístico en el corazón de Villa de la Robla.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button asChild>
              <a href="/register" className="px-8 py-4">Inscribir mi Vehículo</a>
            </Button>
            <Button variant="ghost">Ver Galería</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
