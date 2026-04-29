import React from "react"

export default function Sponsors() {
  return (
    <section
      className="bg-surface-container-lowest border-outline-variant/10 border-y py-8"
      id="patrocinadores"
    >
      <div className="container mx-auto px-6 md:px-12">
        <p className="mb-6 text-center text-[10px] font-bold tracking-[0.4em] text-zinc-400 uppercase">
          Colaboradores & Patrocinadores
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
          <div className="h-10 w-32 rounded-sm bg-zinc-200/50" />
          <div className="h-10 w-24 rounded-sm bg-zinc-200/50" />
          <div className="h-10 w-28 rounded-sm bg-zinc-200/50" />
          <div className="h-10 w-20 rounded-sm bg-zinc-200/50" />
        </div>
      </div>
    </section>
  )
}
