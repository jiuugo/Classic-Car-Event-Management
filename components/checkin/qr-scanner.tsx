"use client"

import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Card, CardContent } from "@/components/ui/card"
import { Prohibit, LockKey } from "@phosphor-icons/react"

const SCANNER_ELEMENT_ID = "qr-reader"

function getCameraErrorMessage(err: unknown): {
  title: string
  message: string
  isInsecureContext: boolean
} {
  const msg =
    typeof err === "string" ? err : (err as any)?.message ?? ""

  const insecure =
    !window.isSecureContext ||
    msg.toLowerCase().includes("insecure") ||
    msg.toLowerCase().includes("permission denied") ||
    (navigator.mediaDevices === undefined && window.location.protocol === "http:")

  if (insecure) {
    return {
      title: "Se requiere HTTPS",
      message:
        "El navegador bloquea el acceso a la cámara en conexiones no seguras (HTTP). Para probar en tu móvil, ejecuta 'pnpm tunnel' en otra terminal y abre la URL HTTPS que se genere.",
      isInsecureContext: true,
    }
  }

  if (msg.toLowerCase().includes("notfound")) {
    return {
      title: "Cámara no detectada",
      message:
        "No se encontró ninguna cámara en este dispositivo.",
      isInsecureContext: false,
    }
  }

  if (msg.toLowerCase().includes("notallowed")) {
    return {
      title: "Permiso denegado",
      message:
        "Has bloqueado el acceso a la cámara. Actívalo en la configuración del navegador y recarga la página.",
      isInsecureContext: false,
    }
  }

  return {
    title: "Cámara no disponible",
    message: msg || "No se pudo iniciar la cámara.",
    isInsecureContext: false,
  }
}

export function QrScanner({ onScan }: { onScan: (token: string) => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const onScanRef = useRef(onScan)
  const [error, setError] = useState<{
    title: string
    message: string
    isInsecureContext: boolean
  } | null>(null)
  const [isStarting, setIsStarting] = useState(true)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.pause()
          onScanRef.current(decodedText)
        },
        () => {
          // ignore frame-level errors
        }
      )
      .then(() => {
        setIsStarting(false)
      })
      .catch((err) => {
        setIsStarting(false)
        setError(getCameraErrorMessage(err))
      })

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {
            // ignore cleanup errors
          })
          .finally(() => {
            scannerRef.current = null
          })
      }
    }
  }, [])

  if (error) {
    return (
      <Card className="flex h-full min-h-[300px] items-center justify-center">
        <CardContent className="flex flex-col items-center gap-3 px-6 text-center">
          {error.isInsecureContext ? (
            <LockKey className="size-10 text-amber-500" />
          ) : (
            <Prohibit className="size-10 text-muted-foreground" />
          )}
          <div className="text-sm font-medium">{error.title}</div>
          <div className="max-w-xs text-xs text-muted-foreground">
            {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] w-full">
        {isStarting && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-sm text-muted-foreground">
            Iniciando cámara…
          </div>
        )}
        <div id={SCANNER_ELEMENT_ID} className="size-full" />
      </div>
    </Card>
  )
}
