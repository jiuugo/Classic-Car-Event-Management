import Image from 'next/image'

export default function Program(): JSX.Element {
  return (
    <section className="py-12 bg-zinc-950 text-white" id="cronograma">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tighter">Programa del Día</h2>
          <div className="h-[1px] flex-grow bg-white/20"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-0">
            <div className="group border-b border-white/10 py-6 flex items-start gap-6 hover:bg-white/5 transition-colors px-4">
              <span className="font-serif text-2xl italic text-surface-tint w-24">09:30</span>
              <div>
                <h4 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Recepción y Verificaciones</h4>
                <p className="text-zinc-500 text-sm">Entrega de acreditaciones y roadbooks en el parque cerrado.</p>
              </div>
            </div>

            <div className="group border-b border-white/10 py-6 flex items-start gap-6 hover:bg-white/5 transition-colors px-4">
              <span className="font-serif text-2xl italic text-surface-tint w-24">11:00</span>
              <div>
                <h4 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Salida de Ruta Turística</h4>
                <p className="text-zinc-500 text-sm">Recorrido por los puertos de montaña y paisajes locales.</p>
              </div>
            </div>

            <div className="group border-b border-white/10 py-6 flex items-start gap-6 hover:bg-white/5 transition-colors px-4">
              <span className="font-serif text-2xl italic text-surface-tint w-24">14:30</span>
              <div>
                <h4 className="text-xl font-bold uppercase tracking-tight mb-2 text-white">Almuerzo de Hermandad</h4>
                <p className="text-zinc-500 text-sm">Degustación de productos locales y entrega de trofeos.</p>
              </div>
            </div>
          </div>

          <div className="relative group">
            <Image alt="Event Visual" className="w-full h-full object-cover rounded-sm opacity-60 transition-opacity duration-500 group-hover:opacity-80" src="/images/event.webp" width={1920} height={1080} />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
