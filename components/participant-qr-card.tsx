"use client"

import React, { useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ParticipantQrCard({ qrToken }: { qrToken: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !qrToken) return

    QRCode.toCanvas(canvasRef.current, qrToken, {
      width: 200,
      margin: 2,
      color: {
        dark: "#1a1a2e",
        light: "#ffffff",
      },
    }).catch(() => {
      // silently ignore rendering errors
    })
  }, [qrToken])

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Código QR</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <div className="rounded-lg border bg-background p-3 shadow-sm">
          <canvas ref={canvasRef} className="size-[200px]" />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Escanea para identificar a este participante en el evento.
        </p>
      </CardContent>
    </Card>
  )
}
