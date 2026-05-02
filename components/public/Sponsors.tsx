import React from "react"

export default function Sponsors() {
  return (
    <section
      className="bg-muted border-border border-y py-20"
      id="patrocinadores"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-serif text-2xl font-black tracking-tighter">
            Colaboradores & Patrocinadores
          </h2>
          <p className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase">
            Gracias a quienes hacen posible este evento
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
          <div className="h-16 w-40 rounded-sm bg-muted-foreground/20" />
          <div className="h-16 w-32 rounded-sm bg-muted-foreground/20" />
          <div className="h-16 w-36 rounded-sm bg-muted-foreground/20" />
          <div className="h-16 w-28 rounded-sm bg-muted-foreground/20" />
        </div>
      </div>
    </section>
  )
}
