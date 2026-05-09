import Image from "next/image"

export default function PublicFooter() {
  return (
    <footer className="mt-12 flex w-full flex-col items-center justify-between gap-4 border-t border-white/5 bg-zinc-950 px-6 py-10 text-center text-white md:flex-row md:gap-8 md:px-12 md:py-16 md:text-left">
      <div className="flex flex-col items-center gap-4 md:items-start">
        <Image
          src="/images/logo.png"
          alt="Villa de la Robla Logo"
          className="h-12 w-auto md:h-16"
          width={1920}
          height={1080}
        />
        <p className="font-sans text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
          © {new Date().getFullYear()} VILLA DE LA ROBLA. HERITAGE & MOTORS.
        </p>
      </div>

      <p className="max-w-xs text-[10px] leading-relaxed font-bold tracking-[0.2em] text-zinc-600 uppercase">
        Organizado por la Asociación de Vehículos Clásicos del Noroeste.
      </p>
    </footer>
  )
}
