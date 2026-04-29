import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Hero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden pt-16">
      <div className="absolute inset-0 z-0">
        <Image
          alt="Hero Image"
          className="h-full w-full object-cover"
          src="/images/hero.webp"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto grid gap-12 px-6 md:grid-cols-2 md:px-12">
        <div className="max-w-2xl space-y-6">
          <div className="bg-surface-tint inline-flex items-center gap-2 rounded-sm px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
            Próxima Edición 2026
          </div>

          <h1 className="font-serif text-4xl leading-[0.9] font-extrabold tracking-tighter text-white md:text-6xl">
            II Concentración de coches clásicos
            <br />
            <span className="text-surface-tint italic">Villa de la Robla</span>
          </h1>

          <p className="max-w-md text-lg leading-relaxed font-light text-zinc-300 md:text-xl">
            Un homenaje a la ingeniería clásica y el legado automovilístico en
            el corazón de Villa de la Robla.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Button asChild>
              <a href="/register" className="px-8 py-4">
                Inscribir mi Vehículo
              </a>
            </Button>
            <Button variant="secondary">Ver Galería</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
