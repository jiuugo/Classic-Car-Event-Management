import { Prisma } from "@/app/generated/prisma/client"

export function mapPrismaError(error: unknown): {
  message: string
  code?: string
} {
  if (!error || typeof error !== "object") return { message: String(error) }

  const e: any = error

  // Prisma known request errors often expose `.code` and `.meta`
  if (e && typeof e.code === "string") {
    if (e.code === "P2002") {
      const target = e.meta?.target ? ` (${JSON.stringify(e.meta.target)})` : ""
      return { message: `Unique constraint failed${target}`, code: e.code }
    }
    return { message: e.message ?? "Database error", code: e.code }
  }

  // Fallback to generic message
  return { message: (e && e.message) || "Unknown error" }
}
