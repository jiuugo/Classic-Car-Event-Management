"use client"

import { QrScanner } from "./qr-scanner"
import { SearchForm } from "./search-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ParticipantCheckinData } from "@/lib/types/checkin.types"
import { Camera } from "@phosphor-icons/react"

export function ScanView({
  scannerKey,
  isSearching,
  onQrScan,
  onSearchResult,
}: {
  scannerKey: number
  isSearching: boolean
  onQrScan: (token: string) => void
  onSearchResult: (data: ParticipantCheckinData) => void
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Scanner */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Camera className="size-5 text-muted-foreground" />
          <h3 className="text-sm font-medium">Escáner QR</h3>
        </div>
        <div className="relative">
          <QrScanner key={scannerKey} onScan={onQrScan} />
          {isSearching && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm">
              <div className="text-sm font-medium text-muted-foreground">
                Buscando participante…
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search fallback */}
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Buscar participante</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchForm onResult={onSearchResult} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
