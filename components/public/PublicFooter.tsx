import Image from "next/image"

export default function PublicFooter() {
  return (
    <footer className="mt-12 flex w-full flex-col items-center justify-between gap-8 border-t border-white/5 bg-zinc-950 px-12 py-16 text-center text-white md:flex-row md:text-left">
      <div className="flex flex-col items-center gap-4 md:items-start">
        <Image
          src="/images/logo.png"
          alt="Villa de la Robla Logo"
          className="h-16 w-auto"
          width={1920}
          height={1080}
        />
        <div>
          <p className="font-sans text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
            © {new Date().getFullYear()} VILLA DE LA ROBLA. HERITAGE & MOTORS.
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        <a
          href="#contacto"
          className="font-sans text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase transition-opacity hover:text-white"
        >
          Contacto
        </a>
        <a
          href="#aviso"
          className="font-sans text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase transition-opacity hover:text-white"
        >
          Aviso Legal
        </a>
        <a
          href="#privacidad"
          className="font-sans text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase transition-opacity hover:text-white"
        >
          Privacidad
        </a>
        <a
          href="#instagram"
          className="font-sans text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase transition-opacity hover:text-white"
        >
          Instagram
        </a>
      </div>

      <div className="max-w-xs text-[10px] leading-relaxed font-bold tracking-[0.2em] text-zinc-600 uppercase">
        Organizado por la Asociación de Vehículos Clásicos del Noroeste.
      </div>
    </footer>
  )
}
