import { z } from "zod"

export const DashboardUserCreateSchema = z
  .object({
    email: z.string().email("Email no válido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirm_password: z.string(),
    role: z.enum(["ADMIN", "STAFF"]),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  })

export type DashboardUserCreateInput = z.infer<typeof DashboardUserCreateSchema>

export const DashboardUserUpdateSchema = z.object({
  email: z.string().email("Email no válido").optional(),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "STAFF"]).optional(),
})

export type DashboardUserUpdateInput = z.infer<typeof DashboardUserUpdateSchema>
