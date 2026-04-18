import React from 'react'

export default function PublicFooter(): JSX.Element {
  return (
    <footer className="bg-zinc-950 text-white w-full flex flex-col md:flex-row justify-between items-center px-12 py-16 gap-8 text-center md:text-left border-t border-white/5 mt-12">
      <div className="flex flex-col items-center md:items-start gap-4">
        <img src="/images/logo.svg" alt="Villa de la Robla Logo" className="h-16 w-auto brightness-0 invert" />
        <div>
          <p className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">© 2024 VILLA DE LA ROBLA. HERITAGE & MOTORS.</p>
        </div>
      </div>

      <div className="flex gap-8">
        <a href="#contacto" className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white transition-opacity">Contacto</a>
        <a href="#aviso" className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white transition-opacity">Aviso Legal</a>
        <a href="#privacidad" className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white transition-opacity">Privacidad</a>
        <a href="#instagram" className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white transition-opacity">Instagram</a>
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-bold max-w-xs leading-relaxed">
        Organizado por la Asociación de Vehículos Clásicos del Noroeste.
      </div>
    </footer>
  )
}
