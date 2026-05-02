import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"
import AdminInscriptionForm from "@/components/admin-inscription-form"

export default function NewParticipantPage() {
  return (
    <div className="px-4 pb-8 lg:px-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/participants">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h2 className="text-xl font-semibold">Nueva inscripción</h2>
      </div>

      <AdminInscriptionForm />
    </div>
  )
}
