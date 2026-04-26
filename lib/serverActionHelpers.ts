import { mapPrismaError } from "./errors"
import { requireAdmin, requireStaffOrAdmin } from "./auth"

export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string }

export function wrapServerAction<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  opts?: { require?: "ADMIN" | "STAFF" }
) {
  return async (...args: TArgs): Promise<ActionResult<TResult>> => {
    try {
      if (opts?.require === "ADMIN") {
        await requireAdmin()
      } else if (opts?.require === "STAFF") {
        await requireStaffOrAdmin()
      }

      const data = await fn(...args)
      return { success: true, data }
    } catch (err) {
      const mapped = mapPrismaError(err)
      return { success: false, error: mapped.message || "Server error" }
    }
  }
}
