import { auth } from "@/auth"

export type CurrentUser = {
  id: string
  email: string
  role: "ADMIN" | "STAFF"
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth()

  if (!session?.user?.id || !session.user.email || !session.user.role) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
  }
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
