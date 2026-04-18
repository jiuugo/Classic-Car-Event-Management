import Image from 'next/image'

export default function Location(): JSX.Element {
  return (
    <section className="relative py-12 bg-white" id="ubicacion">
      <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <span className="text-surface-tint font-bold text-xs uppercase tracking-[0.3em]">El Destino</span>
          <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tighter leading-none">Villa de la Robla, <span className="italic text-zinc-400">León.</span></h2>
          <p className="text-on-surface-variant text-lg">El punto de encuentro será la Plaza de la Constitución, un marco incomparable para lucir la ingeniería clásica.</p>

          <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/20">
            <span className="material-symbols-outlined text-3xl text-surface-tint">location_on</span>
            <div>
              <p className="font-bold uppercase text-xs tracking-tight">Coordenadas del Evento</p>
              <p className="text-sm text-zinc-500">42°51′00″N 5°37′00″O</p>
            </div>
          </div>

          <button className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all">Cómo Llegar</button>
        </div>

        <div className="relative h-[350px] w-full bg-surface-container rounded-xl overflow-hidden shadow-2xl border-4 border-white">
          {/* TODO: look  */}
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d443.03944523207053!2d-5.629341992044571!3d42.80344525817155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd37a3f5fa061965%3A0xa4d8d9c2928c8c31!2sPl.%20la%20Constituci%C3%B3n%2C%2024640%20La%20Robla%2C%20Le%C3%B3n!5e0!3m2!1ses!2ses!4v1776528435353!5m2!1ses!2ses" width="600" height="450" loading="lazy" ></iframe>
          <div className="absolute top-1/2 left-1/2 -translate-x-12 -translate-y-12 w-24 h-24 bg-surface-tint/20 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-4 h-4 bg-surface-tint rounded-full ring-4 ring-white"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
