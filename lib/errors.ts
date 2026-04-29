import { Prisma } from "@/app/generated/prisma/client"

export function mapPrismaError(error: unknown): {
  message: string
  code?: string
  fields?: string[]
} {
  if (!error || typeof error !== "object") return { message: String(error) }

  const e: any = error

  // Prisma known request errors often expose `.code` and `.meta`
  if (e && typeof e.code === "string") {
    // Unique constraint
    if (e.code === "P2002") {
      // `meta.target` may be an array of columns or a string (constraint name)
      let fields: string[] = []
      const target = e.meta?.target

      // Debug: log the raw Prisma meta so we can see what format it arrives in
      console.log("[mapPrismaError] P2002 meta:", JSON.stringify(e.meta), "| message:", e.message)

      const known = ["email", "national_id", "license_plate", "qr_token"]

      if (Array.isArray(target)) {
        fields = target.map(String)
      } else if (typeof target === "string") {
        const t = String(target)
        known.forEach((k) => {
          if (t.includes(k) && !fields.includes(k)) fields.push(k)
        })
        // fallback: return the raw string as a single field so caller has something to work with
        if (fields.length === 0) fields = [t]
      }

      // Fallback: if meta.target was missing/unhelpful, scan the Prisma error message itself.
      // Prisma always includes the field in the message, e.g.:
      //   "Unique constraint failed on the fields: (`email`)"
      //   "Unique constraint failed on the constraint: `Participant_email_key`"
      if (fields.length === 0 && typeof e.message === "string") {
        known.forEach((k) => {
          if (e.message.includes(k) && !fields.includes(k)) fields.push(k)
        })
      }

      // friendly single-field messages (Spanish)
      const fieldMessageMap: Record<string, string> = {
        email: "Este email ya está registrado",
        national_id: "Este DNI/NIE ya está registrado",
        license_plate: "Esta matrícula ya está registrada",
        qr_token: "Ya existe un participante con este identificador",
      }

      let message: string
      if (fields.length === 1) {
        const f = fields[0]
        message =
          fieldMessageMap[f] ??
          `Ya existe un registro con datos duplicados (${f})`
      } else if (fields.length > 1) {
        message = `Ya existe un registro con datos duplicados (${fields.join(", ")})`
      } else {
        message = "Ya existe un registro con esos datos"
      }

      return { message, code: e.code, fields }
    }

    return { message: e.message ?? "Database error", code: e.code }
  }

  // Fallback to generic message
  return { message: (e && e.message) || "Unknown error" }
}
