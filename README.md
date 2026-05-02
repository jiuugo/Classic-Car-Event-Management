# Classic Car Event Management

A full-stack Next.js application for managing classic car event registrations, payments, check-ins, and raffle draws.

Built for **Concentración de coches clásicos Villa de la Robla**.

---

## Features

### Public Area
- **Landing page** — event info, gallery, program, location, sponsors
- **Online registration** — multi-step form (participant → vehicles → payment)
- **Stripe Checkout** — secure payment processing (10 € per vehicle)
- **QR codes** — generated for each participant for event day check-in

### Admin Dashboard
- **KPIs & charts** — real-time stats, attendance rates, revenue tracking
- **Participants** — CRUD, search, QR code generation
- **Vehicles** — manage participant vehicles
- **Registrations & payments** — order tracking, status filtering, reconciliation
- **Check-in hub** — QR scanner + manual search for event day entry
- **Raffle draw** — eligible checked-in vehicles
- **Role-based access** — ADMIN and STAFF roles

---

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma 7](https://www.prisma.io/)
- **Auth:** [Auth.js v5](https://authjs.dev/) (Credentials provider, JWT sessions)
- **Payments:** [Stripe](https://stripe.com/) (Checkout Sessions + webhooks)
- **Validation:** [Zod](https://zod.dev/)

---

## Screenshots

> _Screenshots will be added here._
>
> - Landing page
> - Registration form
> - Admin dashboard
> - Check-in scanner

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/)
- [PostgreSQL](https://www.postgresql.org/) database
- [Stripe](https://stripe.com/) account (test mode for development)

---

## Installation

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your database URL, Stripe keys, and auth secret

# 3. Generate Prisma client & run migrations
pnpm prisma generate
pnpm prisma migrate dev

# 4. Seed the database
pnpm tsx prisma/seed.ts

# 5. Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file with the following variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode for dev) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret |
| `RECONCILE_SECRET` | Secret token for payment reconciliation endpoint |
| `AUTH_SECRET` | Auth.js v5 secret key |

---

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Build for production |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm prisma generate` | Generate Prisma client to `app/generated/prisma/` |
| `pnpm prisma migrate dev` | Create and apply database migrations |
| `pnpm tsx prisma/seed.ts` | Seed database with sample data |

---

## Authentication

The application uses Auth.js v5 with a credentials provider against the `DashboardUser` table.

**Default seed credentials:**
- Admin: `admin@example.com` / `password`
- Staff: `staff@example.com` / `password`

Roles:
- **ADMIN** — full access including settings
- **STAFF** — dashboard access without admin-only areas

---

## Stripe Webhook (Local Development)

To test payment webhooks locally:

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Forward events to your local endpoint:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```
3. Copy the webhook signing secret into your `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Project Structure

```
app/
  (public-area)/          # Public pages (landing, registration)
  dashboard/              # Admin dashboard pages
  actions/                # Server actions (mutations)
  api/                    # API routes (checkout, webhook, reconcile, auth)
  generated/prisma/       # Prisma client output (non-standard path)
components/               # UI components & shadcn primitives
lib/                      # Utilities, auth, validation, errors
prisma/
  schema.prisma           # Database schema
  seed.ts                 # Seed script
  migrations/             # Committed migrations
```

---

## Architecture Notes

- **Server actions** handle all mutations. API routes are reserved for Stripe-specific endpoints.
- **Prisma client** is generated to `app/generated/prisma/` — always run `pnpm prisma generate` after schema changes.
- **Auth.js v5** uses JWT sessions. The session provider wraps the app in `app/providers.tsx`.
- **Payment flow:** Registration is created with `PENDING` status before Stripe Checkout. The webhook flips it to `PAID` on success.
- **Reconciliation:** A manual endpoint (`GET /api/reconcile?token=...`) syncs pending registrations with Stripe.
- **Check-in:** Uses QR codes generated from `Participant.qr_token` with a hash index for fast lookups.
- **Raffle ticket numbers:** `RegistrationItem.entry_number` (unique) serves as the raffle identifier.

---

## Deployment

This is a standard Next.js application that can be deployed to any platform supporting Node.js:

1. Set all required environment variables
2. Run `pnpm prisma migrate deploy` to apply database migrations
3. Build with `pnpm build`
4. Start with `pnpm start`

Make sure the `STRIPE_WEBHOOK_SECRET` is updated to your production webhook endpoint.
