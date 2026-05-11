import { notFound } from "next/navigation"
import { getParticipantById } from "@/app/actions/participants.server"
import ParticipantDetailHeader from "@/components/participant-detail-header"
import ParticipantQrCard from "@/components/participant-qr-card"
import ParticipantVehiclesTab from "@/components/participant-vehicles-tab"
import ParticipantRegistrationsTab from "@/components/participant-registrations-tab"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import type { ParticipantDetail } from "@/lib/types/participant.types"

export default async function ParticipantDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ tab?: string }>
}) {
  const { id } = await props.params
  const searchParams = props.searchParams ? await props.searchParams : {}
  const defaultTab =
    searchParams.tab === "registrations" ? "registrations" : "vehicles"

  const result = await getParticipantById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  // Serialise dates and decimals for client components
  const raw = result.data as any
  const participant: ParticipantDetail = {
    id: raw.id,
    full_name: raw.full_name,
    email: raw.email,
    national_id: raw.national_id,
    qr_token: raw.qr_token,
    vehicles: (raw.vehicles ?? []).map((v: any) => ({
      id: v.id,
      brand: v.brand,
      model: v.model,
      license_plate: v.license_plate,
    })),
    registrations: (raw.registrations ?? []).map((r: any) => ({
      id: r.id,
      status: r.status,
      items: (r.items ?? []).map((item: any) => ({
        id: item.id,
        entry_number: item.entry_number,
        checkin_date: item.checkin_date
          ? typeof item.checkin_date === "string"
            ? item.checkin_date
            : item.checkin_date.toISOString()
          : null,
        vehicle: {
          id: item.vehicle?.id ?? "",
          brand: item.vehicle?.brand ?? "",
          model: item.vehicle?.model ?? "",
          license_plate: item.vehicle?.license_plate ?? "",
        },
      })),
      payments: (r.payments ?? []).map((p: any) => ({
        id: p.id,
        provider: p.provider,
        amount: String(p.amount),
        status: p.status,
      })),
    })),
  }

  return (
    <div className="px-4 pb-8 lg:px-6">
      <ParticipantDetailHeader participant={participant} />

      {/* Main content: QR + Tabs */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar: QR Code */}
        <div className="flex flex-col gap-4">
          <ParticipantQrCard qrToken={participant.qr_token} />
        </div>

        {/* Tabbed content */}
        <Tabs defaultValue={defaultTab}>
          <TabsList variant="line">
            <TabsTrigger value="vehicles">
              Vehículos ({participant.vehicles.length})
            </TabsTrigger>
            <TabsTrigger value="registrations">
              Inscripciones ({participant.registrations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-4">
            <ParticipantVehiclesTab
              vehicles={participant.vehicles}
              registrations={participant.registrations}
            />
          </TabsContent>

          <TabsContent value="registrations" className="mt-4">
            <ParticipantRegistrationsTab
              registrations={participant.registrations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
