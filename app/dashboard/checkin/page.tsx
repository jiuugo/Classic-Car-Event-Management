"use client"

import { useCallback, useState, useTransition } from "react"
import { toast } from "sonner"
import { ScanView } from "@/components/checkin/scan-view"
import { ParticipantCard } from "@/components/checkin/participant-card"
import { ItemList } from "@/components/checkin/item-list"
import { ConfirmationBar } from "@/components/checkin/confirmation-bar"
import {
  searchParticipantForCheckin,
  checkinRegistrationItems,
} from "@/app/actions/checkin.server"
import type { ParticipantCheckinData } from "@/lib/types/checkin.types"

export default function CheckinPage() {
  const [stage, setStage] = useState<"scan" | "result">("scan")
  const [participant, setParticipant] = useState<ParticipantCheckinData | null>(
    null
  )
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSearching, startSearch] = useTransition()
  const [isCheckingIn, startCheckin] = useTransition()
  const [scannerKey, setScannerKey] = useState(0)

  const handleSearchResult = useCallback((data: ParticipantCheckinData) => {
    setParticipant(data)
    setSelectedIds([])
    setStage("result")
  }, [])

  const handleQrScan = useCallback(
    (token: string) => {
      startSearch(async () => {
        const res = await searchParticipantForCheckin(token)
        if (res.success) {
          setParticipant(res.data)
          setSelectedIds([])
          setStage("result")
        } else {
          toast.error(res.error)
          setScannerKey((k) => k + 1)
        }
      })
    },
    []
  )

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }, [])

  const handleSelectAllPending = useCallback(() => {
    setSelectedIds((prev) => {
      if (!participant) return prev
      const pending = participant.items
        .filter((i) => !i.checkin_date)
        .map((i) => i.id)
      return pending
    })
  }, [participant])

  const handleClearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const handleConfirm = useCallback(() => {
    if (selectedIds.length === 0) return

    startCheckin(async () => {
      const res = await checkinRegistrationItems({
        itemIds: selectedIds,
        mode: "mark",
      })

      if (res.success) {
        const count = (res as any).updatedCount ?? selectedIds.length
        toast.success(`${count} vehículo(s) registrado(s)`)

        setParticipant((prev) => {
          if (!prev) return prev
          const now = new Date().toISOString()
          return {
            ...prev,
            items: prev.items.map((item) =>
              selectedIds.includes(item.id)
                ? { ...item, checkin_date: now }
                : item
            ),
          }
        })
        setSelectedIds([])
      } else {
        toast.error(res.error || "Error al registrar entrada")
      }
    })
  }, [selectedIds])

  const handleNextScan = useCallback(() => {
    setStage("scan")
    setParticipant(null)
    setSelectedIds([])
  }, [])

  if (stage === "scan") {
    return (
      <div className="px-4 pb-8 lg:px-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Registro de entrada</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escanea un código QR o busca por matrícula / DNI para registrar la
            entrada de vehículos.
          </p>
        </div>

        <ScanView
          scannerKey={scannerKey}
          isSearching={isSearching}
          onQrScan={handleQrScan}
          onSearchResult={handleSearchResult}
        />
      </div>
    )
  }

  if (!participant) return null

  return (
    <div className="px-4 pb-28 lg:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Resultado del escaneo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa los vehículos y confirma los que entran ahora.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ParticipantCard
          full_name={participant.full_name}
          email={participant.email}
          national_id={participant.national_id}
        />

        <ItemList
          items={participant.items}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onSelectAllPending={handleSelectAllPending}
          onClearSelection={handleClearSelection}
        />
      </div>

      <ConfirmationBar
        selectedCount={selectedIds.length}
        totalCount={participant.items.length}
        isPending={isCheckingIn}
        onConfirm={handleConfirm}
        onNextScan={handleNextScan}
      />
    </div>
  )
}
