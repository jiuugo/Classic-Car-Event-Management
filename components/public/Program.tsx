import Image from "next/image"

export default function Program() {
  return (
    <section className="bg-zinc-950 py-12 text-white" id="cronograma">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="font-serif text-3xl font-bold tracking-tighter italic md:text-4xl">
            Programa del Día
          </h2>
          <div className="h-[1px] flex-grow bg-white/20"></div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-0">
            <div className="group flex items-start gap-6 border-b border-white/10 px-4 py-6 transition-colors hover:bg-white/5">
              <span className="text-surface-tint w-24 font-serif text-2xl italic">
                09:30
              </span>
              <div>
                <h4 className="mb-2 text-xl font-bold tracking-tight text-white uppercase">
                  Recepción y Verificaciones
                </h4>
                <p className="text-sm text-zinc-500">
                  Entrega de acreditaciones y roadbooks en el parque cerrado.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-6 border-b border-white/10 px-4 py-6 transition-colors hover:bg-white/5">
              <span className="text-surface-tint w-24 font-serif text-2xl italic">
                11:00
              </span>
              <div>
                <h4 className="mb-2 text-xl font-bold tracking-tight text-white uppercase">
                  Salida de Ruta Turística
                </h4>
                <p className="text-sm text-zinc-500">
                  Recorrido por los puertos de montaña y paisajes locales.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-6 border-b border-white/10 px-4 py-6 transition-colors hover:bg-white/5">
              <span className="text-surface-tint w-24 font-serif text-2xl italic">
                14:30
              </span>
              <div>
                <h4 className="mb-2 text-xl font-bold tracking-tight text-white uppercase">
                  Almuerzo de Hermandad
                </h4>
                <p className="text-sm text-zinc-500">
                  Degustación de productos locales y entrega de trofeos.
                </p>
              </div>
            </div>
          </div>

          <div className="group relative">
            <Image
              alt="Event Visual"
              className="h-full w-full rounded-sm object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80"
              src="/images/event.webp"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
