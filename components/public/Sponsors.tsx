import React from 'react'

export default function Sponsors(): JSX.Element {
  return (
    <section className="py-8 bg-surface-container-lowest border-y border-outline-variant/10" id="patrocinadores">
      <div className="container mx-auto px-6 md:px-12">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-6">Colaboradores & Patrocinadores</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="h-10 w-32 bg-zinc-200/50 rounded-sm" />
          <div className="h-10 w-24 bg-zinc-200/50 rounded-sm" />
          <div className="h-10 w-28 bg-zinc-200/50 rounded-sm" />
          <div className="h-10 w-20 bg-zinc-200/50 rounded-sm" />
        </div>
      </div>
    </section>
  )
}
