function isDev(): boolean {
  return process.env.NODE_ENV === "development"
}

function publicMessage(msg: string): string {
  return isDev()
    ? msg
    : "Ha ocurrido un error inesperado. Inténtalo de nuevo más tarde."
}

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
      let fields: string[] = []
      const target = e.meta?.target

      console.log(
        "[mapPrismaError] P2002 meta:",
        JSON.stringify(e.meta),
        "| message:",
        e.message
      )

      const known = ["email", "national_id", "license_plate", "qr_token"]

      if (Array.isArray(target)) {
        fields = target.map(String)
      } else if (typeof target === "string") {
        const t = String(target)
        known.forEach((k) => {
          if (t.includes(k) && !fields.includes(k)) fields.push(k)
        })
        if (fields.length === 0) fields = [t]
      }

      if (fields.length === 0 && typeof e.message === "string") {
        known.forEach((k) => {
          if (e.message.includes(k) && !fields.includes(k)) fields.push(k)
        })
      }

      const fieldMessageMap: Record<string, string> = {
        email:
          "Este email ya está asociado a una inscripción. Si crees que es un error, contacta con la organización.",
        national_id:
          "Este DNI/NIE ya está asociado a una inscripción. Si crees que es un error, contacta con la organización.",
        license_plate: "Esta matrícula ya está registrada en el evento.",
        qr_token: "Error interno. Inténtalo de nuevo.",
      }

      let message: string
      if (fields.length === 1) {
        const f = fields[0]
        message =
          fieldMessageMap[f] ?? "Ya existe una inscripción con estos datos."
      } else if (fields.length > 1) {
        message =
          "Algunos de estos datos ya figuran en otra inscripción. Revisa los campos destacados."
      } else {
        message = "Ya existe una inscripción con estos datos."
      }

      return { message, code: e.code, fields }
    }

    return { message: publicMessage(e.message ?? "Database error"), code: e.code }
  }

  return { message: publicMessage((e && e.message) || "Unknown error") }
}
