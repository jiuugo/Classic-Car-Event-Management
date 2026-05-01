import { notFound } from "next/navigation"
import { getRegistrationById } from "@/app/actions/registrations.server"
import RegistrationDetail from "@/components/registration-detail"

export default async function RegistrationDetailPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const result = await getRegistrationById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  return <RegistrationDetail registration={result.data} />
}
