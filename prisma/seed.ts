import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL ?? "";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Seeding database with example data...");

	const admin = await prisma.dashboardUser.create({
		data: {
			email: "admin@example.com",
			password_hash: "changeme",
			role: "ADMIN",
		},
	});

	const alice = await prisma.participant.create({
		data: {
			national_id: "A12345678",
			full_name: "Alice García",
			email: "alice@example.com",
			qr_token: "alice-qr-token",
		},
	});

	const bob = await prisma.participant.create({
		data: {
			national_id: "B87654321",
			full_name: "Bob Pérez",
			email: "bob@example.com",
			qr_token: "bob-qr-token",
		},
	});

	const charlie = await prisma.participant.create({
		data: {
			national_id: "C13572468",
			full_name: "Charlie Rodriguez",
			email: "charlie@example.com",
			qr_token: "charlie-qr-token",
		},
	});

	const diana = await prisma.participant.create({
		data: {
			national_id: "D24681357",
			full_name: "Diana Lopez",
			email: "diana@example.com",
			qr_token: "diana-qr-token",
		},
	});

	const aliceVehicle = await prisma.vehicle.create({
		data: {
			brand: "Ford",
			model: "Mustang",
			license_plate: "ABC-123",
			participant: { connect: { id: alice.id } },
		},
	});

	const bobVehicle = await prisma.vehicle.create({
		data: {
			brand: "Volkswagen",
			model: "Beetle",
			license_plate: "XYZ-987",
			participant: { connect: { id: bob.id } },
		},
	});

	const charlieVehicle = await prisma.vehicle.create({
		data: {
			brand: "Seat",
			model: "600",
			license_plate: "M-123456",
			participant: { connect: { id: charlie.id } },
		},
	});

	const dianaVehicle = await prisma.vehicle.create({
		data: {
			brand: "Citroen",
			model: "2CV",
			license_plate: "B-987654",
			participant: { connect: { id: diana.id } },
		},
	});

	const dianaSecondVehicle = await prisma.vehicle.create({
		data: {
			brand: "Renault",
			model: "4L",
			license_plate: "M-556677",
			participant: { connect: { id: diana.id } },
		},
	});

	const registrationAlice = await prisma.registration.create({
		data: {
			participant: { connect: { id: alice.id } },
			status: "PAID",
		},
	});

	const registrationCharlie = await prisma.registration.create({
		data: {
			participant: { connect: { id: charlie.id } },
			status: "PAID",
		},
	});

	const registrationDiana = await prisma.registration.create({
		data: {
			participant: { connect: { id: diana.id } },
			status: "PENDING",
		},
	});

	await prisma.registrationItem.create({
		data: {
			registration: { connect: { id: registrationAlice.id } },
			vehicle: { connect: { id: aliceVehicle.id } },
			entry_number: 1,
			checkin_date: new Date(),
		},
	});

	await prisma.registrationItem.create({
		data: {
			registration: { connect: { id: registrationCharlie.id } },
			vehicle: { connect: { id: charlieVehicle.id } },
			entry_number: 3,
			checkin_date: new Date(),
		},
	});

	await prisma.registrationItem.create({
		data: {
			registration: { connect: { id: registrationDiana.id } },
			vehicle: { connect: { id: dianaVehicle.id } },
			entry_number: 4,
		},
	});

	await prisma.registrationItem.create({
		data: {
			registration: { connect: { id: registrationDiana.id } },
			vehicle: { connect: { id: dianaSecondVehicle.id } },
			entry_number: 5,
		},
	});

	await prisma.payment.create({
		data: {
			registration: { connect: { id: registrationAlice.id } },
			provider: "STRIPE",
			amount: new Prisma.Decimal("30.00"),
			status: "COMPLETED",
		},
	});

	await prisma.payment.create({
		data: {
			registration: { connect: { id: registrationCharlie.id } },
			provider: "PAYPAL",
			amount: new Prisma.Decimal("30.00"),
			status: "COMPLETED",
		},
	});

	const registrationBob = await prisma.registration.create({
		data: {
			participant: { connect: { id: bob.id } },
			status: "PENDING",
			items: {
				create: [
					{
						vehicle: { connect: { id: bobVehicle.id } },
						entry_number: 2,
					},
				],
			},
		},
		include: { items: true },
	});

	console.log("Seeding complete:", {
		admin: admin.email,
		participants: [alice.email, bob.email, charlie.email, diana.email],
		registrations: [registrationAlice.id, registrationBob.id, registrationCharlie.id, registrationDiana.id],
	});
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});