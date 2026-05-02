"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { SignInIcon } from "@phosphor-icons/react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

export default function PublicHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isRegisterPage = pathname.startsWith("/register")

  return (
    <nav className="fixed top-0 left-0 z-50 flex w-full max-w-[100vw] items-center justify-between bg-background/80 px-6 py-3 shadow-sm backdrop-blur-md md:px-12 overflow-x-hidden">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="Villa de la Robla Logo"
            className="h-12 w-auto object-contain"
            width={1920}
            height={1080}
          />
        </Link>
      </div>

      {!isRegisterPage && (
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#cronograma"
            className="hover:text-primary text-xs font-medium tracking-widest text-foreground/70 uppercase transition-colors"
          >
            Cronograma
          </a>
          <a
            href="#ubicacion"
            className="hover:text-primary text-xs font-medium tracking-widest text-foreground/70 uppercase transition-colors"
          >
            Ubicación
          </a>
          <a
            href="#participar"
            className="hover:text-primary text-xs font-medium tracking-widest text-foreground/70 uppercase transition-colors"
          >
            Participar
          </a>
          <a
            href="#patrocinadores"
            className="hover:text-primary text-xs font-medium tracking-widest text-foreground/70 uppercase transition-colors"
          >
            Patrocinadores
          </a>
        </div>
      )}

      <div className="flex items-center gap-2 md:gap-4">
        <Button asChild variant="ghost" size="sm" className="px-2 md:px-4 text-foreground/70 hover:text-primary">
          <Link href="/dashboard">
            <SignInIcon className="size-4 md:mr-2" />
            <span className="hidden md:inline">{session ? "Dashboard" : "Iniciar sesión"}</span>
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Inscribirse</Link>
        </Button>
      </div>
    </nav>
  )
}
