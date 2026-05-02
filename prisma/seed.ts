import "dotenv/config"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "app/generated/prisma/client"
import bcrypt from "bcryptjs"

const connectionString = process.env.DATABASE_URL ?? ""
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding database with example data...")

  const hashedPassword = await bcrypt.hash("password", 12)

  // --- Dashboard Users ---
  await prisma.dashboardUser.create({
    data: {
      email: "admin@example.com",
      password_hash: hashedPassword,
      role: "ADMIN",
    },
  })
  await prisma.dashboardUser.create({
    data: {
      email: "staff@example.com",
      password_hash: hashedPassword,
      role: "STAFF",
    },
  })
  console.log("Created 2 dashboard users")

  // --- Participants ---
  const juan = await prisma.participant.create({
    data: {
      national_id: "12345678A",
      full_name: "Juan García López",
      email: "juan.garcia@email.com",
      qr_token: "qr-juan-garcia",
    },
  })
  const maria = await prisma.participant.create({
    data: {
      national_id: "87654321B",
      full_name: "María Martínez Ruiz",
      email: "maria.martinez@email.com",
      qr_token: "qr-maria-martinez",
    },
  })
  const carlos = await prisma.participant.create({
    data: {
      national_id: "11111111C",
      full_name: "Carlos Sánchez Pérez",
      email: "carlos.sanchez@email.com",
      qr_token: "qr-carlos-sanchez",
    },
  })
  const ana = await prisma.participant.create({
    data: {
      national_id: "22222222D",
      full_name: "Ana López Fernández",
      email: "ana.lopez@email.com",
      qr_token: "qr-ana-lopez",
    },
  })
  const pedro = await prisma.participant.create({
    data: {
      national_id: "33333333E",
      full_name: "Pedro Rodríguez Gómez",
      email: "pedro.rodriguez@email.com",
      qr_token: "qr-pedro-rodriguez",
    },
  })
  const laura = await prisma.participant.create({
    data: {
      national_id: "44444444F",
      full_name: "Laura Jiménez Díaz",
      email: "laura.jimenez@email.com",
      qr_token: "qr-laura-jimenez",
    },
  })
  console.log("Created 6 participants")

  // --- Vehicles ---
  // Juan: 2 vehicles
  const seat124 = await prisma.vehicle.create({
    data: {
      participant_id: juan.id,
      brand: "SEAT",
      model: "124",
      license_plate: "1234ABC",
    },
  })
  const bmw2002 = await prisma.vehicle.create({
    data: {
      participant_id: juan.id,
      brand: "BMW",
      model: "2002",
      license_plate: "5678DEF",
    },
  })
  // María: 1 vehicle
  const mercedes = await prisma.vehicle.create({
    data: {
      participant_id: maria.id,
      brand: "Mercedes-Benz",
      model: "280 SL",
      license_plate: "9012GHI",
    },
  })
  // Carlos: 1 vehicle
  const mustang = await prisma.vehicle.create({
    data: {
      participant_id: carlos.id,
      brand: "Ford",
      model: "Mustang",
      license_plate: "3456JKL",
    },
  })
  // Ana: 1 vehicle
  const beetle = await prisma.vehicle.create({
    data: {
      participant_id: ana.id,
      brand: "Volkswagen",
      model: "Escarabajo",
      license_plate: "7890MNO",
    },
  })
  // Pedro: 2 vehicles
  const deuxChevaux = await prisma.vehicle.create({
    data: {
      participant_id: pedro.id,
      brand: "Citroën",
      model: "2CV",
      license_plate: "1234PQR",
    },
  })
  const jaguar = await prisma.vehicle.create({
    data: {
      participant_id: pedro.id,
      brand: "Jaguar",
      model: "E-Type",
      license_plate: "5678STU",
    },
  })
  // Laura: 1 vehicle (no registration — edge case)
  await prisma.vehicle.create({
    data: {
      participant_id: laura.id,
      brand: "Porsche",
      model: "911",
      license_plate: "9012VWX",
    },
  })
  console.log("Created 8 vehicles")

  // --- Registrations ---
  const now = new Date()

  // Juan (PENDING — recent)
  const regJuan = await prisma.registration.create({
    data: {
      participant_id: juan.id,
      status: "PENDING",
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    },
  })
  // María (PENDING — older)
  const regMaria = await prisma.registration.create({
    data: {
      participant_id: maria.id,
      status: "PENDING",
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
  })
  // Carlos (PAID — via Stripe)
  const regCarlos = await prisma.registration.create({
    data: {
      participant_id: carlos.id,
      status: "PAID",
      stripe_session_id: "cs_test_" + crypto.randomUUID().replace(/-/g, ""),
      created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
  })
  // Pedro (PAID — via manual, one vehicle checked in)
  const regPedro = await prisma.registration.create({
    data: {
      participant_id: pedro.id,
      status: "PAID",
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  })
  // Ana (CANCELLED)
  const regAna = await prisma.registration.create({
    data: {
      participant_id: ana.id,
      status: "CANCELLED",
      created_at: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
    },
  })
  console.log("Created 5 registrations")

  // --- Registration Items ---
  await prisma.registrationItem.create({
    data: {
      registration_id: regJuan.id,
      vehicle_id: seat124.id,
      entry_number: 101,
    },
  })
  await prisma.registrationItem.create({
    data: {
      registration_id: regJuan.id,
      vehicle_id: bmw2002.id,
      entry_number: 102,
    },
  })
  await prisma.registrationItem.create({
    data: {
      registration_id: regMaria.id,
      vehicle_id: mercedes.id,
      entry_number: 103,
    },
  })
  await prisma.registrationItem.create({
    data: {
      registration_id: regCarlos.id,
      vehicle_id: mustang.id,
      entry_number: 104,
    },
  })
  await prisma.registrationItem.create({
    data: {
      registration_id: regPedro.id,
      vehicle_id: deuxChevaux.id,
      entry_number: 105,
      checkin_date: now,
    },
  })
  await prisma.registrationItem.create({
    data: {
      registration_id: regPedro.id,
      vehicle_id: jaguar.id,
      entry_number: 106,
    },
  })
  await prisma.registrationItem.create({
    data: {
      registration_id: regAna.id,
      vehicle_id: beetle.id,
      entry_number: 107,
    },
  })
  console.log("Created 7 registration items")

  // --- Payments ---
  await prisma.payment.create({
    data: {
      registration_id: regCarlos.id,
      provider: "STRIPE",
      amount: 50.0,
      status: "COMPLETED",
    },
  })
  await prisma.payment.create({
    data: {
      registration_id: regPedro.id,
      provider: "MANUAL",
      amount: 75.0,
      status: "COMPLETED",
    },
  })
  console.log("Created 2 payments")

  console.log("\nSeed complete!")
  console.log("  Admin login:  admin@example.com / password")
  console.log("  Staff login:  staff@example.com / password")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
