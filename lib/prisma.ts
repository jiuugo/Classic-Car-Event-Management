/*
  Centralized Prisma client singleton to avoid multiple instances in dev.
  Import the generated Prisma client from app/generated/prisma/client.
*/
import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

declare global {
   
  var prisma: PrismaClient | undefined
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
})

const prisma = globalThis.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma

export default prisma
