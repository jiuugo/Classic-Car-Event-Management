import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function PublicHeader(): JSX.Element {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 py-3 shadow-sm">
      <div className="flex items-center gap-4">
        <Image src="/images/logo.png" alt="Villa de la Robla Logo" className="h-12 w-auto object-contain" width={1920} height={1080} />
      </div>

      <div className="hidden md:flex items-center gap-8">
        <a href="#cronograma" className="text-zinc-600 font-medium uppercase tracking-widest text-xs hover:text-surface-tint transition-colors">Cronograma</a>
        <a href="#ubicacion" className="text-zinc-600 font-medium uppercase tracking-widest text-xs hover:text-surface-tint transition-colors">Ubicación</a>
        <a href="#participar" className="text-zinc-600 font-medium uppercase tracking-widest text-xs hover:text-surface-tint transition-colors">Participar</a>
        <a href="#patrocinadores" className="text-zinc-600 font-medium uppercase tracking-widest text-xs hover:text-surface-tint transition-colors">Patrocinadores</a>
      </div>

      <div className="flex items-center gap-4">
        <Button asChild>
          <Link href="/register">Inscribirse</Link>
        </Button>
      </div>
    </nav>
  )
}
