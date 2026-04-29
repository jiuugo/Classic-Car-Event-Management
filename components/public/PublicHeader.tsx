import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function PublicHeader() {
  return (
    <nav className="fixed top-0 left-0 z-50 flex w-full items-center justify-between bg-white/80 px-6 py-3 shadow-sm backdrop-blur-md md:px-12">
      <div className="flex items-center gap-4">
        <Image
          src="/images/logo.png"
          alt="Villa de la Robla Logo"
          className="h-12 w-auto object-contain"
          width={1920}
          height={1080}
        />
      </div>

      <div className="hidden items-center gap-8 md:flex">
        <a
          href="#cronograma"
          className="hover:text-surface-tint text-xs font-medium tracking-widest text-zinc-600 uppercase transition-colors"
        >
          Cronograma
        </a>
        <a
          href="#ubicacion"
          className="hover:text-surface-tint text-xs font-medium tracking-widest text-zinc-600 uppercase transition-colors"
        >
          Ubicación
        </a>
        <a
          href="#participar"
          className="hover:text-surface-tint text-xs font-medium tracking-widest text-zinc-600 uppercase transition-colors"
        >
          Participar
        </a>
        <a
          href="#patrocinadores"
          className="hover:text-surface-tint text-xs font-medium tracking-widest text-zinc-600 uppercase transition-colors"
        >
          Patrocinadores
        </a>
      </div>

      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/register">Inscribirse</Link>
        </Button>
      </div>
    </nav>
  )
}
