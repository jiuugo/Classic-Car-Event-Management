import { cookies } from "next/headers"

export type CurrentUser = {
  id: string
  email: string
  role: "ADMIN" | "STAFF"
}

/**
 * getCurrentUser()
 * - Dev mode: returns a mock user based on env vars (DEV_USER_ROLE / DEV_USER_EMAIL)
 * - Prod: stub that reads a `session` cookie; implement your session lookup here.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (process.env.NODE_ENV === "development") {
    const role = (process.env.DEV_USER_ROLE as "ADMIN" | "STAFF") ?? "ADMIN"
    return {
      id: "dev-user",
      email: process.env.DEV_USER_EMAIL ?? "dev@example.com",
      role,
    }
  }

  const cookieStore = await cookies()
  const session = cookieStore.get("session")?.value
  if (!session) return null

  // TODO: verify session token / lookup session in DB or auth provider
  return null
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: admin required")
  }
  return user
}

export async function requireStaffOrAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user || (user.role !== "ADMIN" && user.role !== "STAFF")) {
    throw new Error("Unauthorized: staff or admin required")
  }
  return user
}
