# AGENTS.md — Classic Car Event Management

## Stack

- **Next.js 16** (App Router, Turbopack in dev) · **React 19**
- **Tailwind CSS v4** + `@tailwindcss/postcss` (NOT `tailwind.config.js`)
- **shadcn/ui** v4 (style: `radix-maia`, icons: `phosphor`) — add via `npx shadcn@latest add <name>`
- **Prisma 7** + PostgreSQL (`pg` pool via `@prisma/adapter-pg`, NOT Prisma Accelerate/Postgres)
- **Auth.js v5** (NextAuth) — credentials provider against `DashboardUser` table, JWT sessions
- **Stripe** (Checkout Sessions + webhook)
- **pnpm** (package manager)

## Commands

| Command | Usual order |
|---------|-------------|
| `pnpm dev` | Next dev with turbopack |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier (double quotes, no semis, trailing commas es5, 80 width) |
| `pnpm typecheck` | `tsc --noEmit` — run after lint, before build |
| `pnpm build` | Next build (fails if typecheck fails) |
| `pnpm tunnel` | Exposes dev server via `localtunnel` (port 3000) |

### Prisma

```
pnpm prisma generate          # writes client to app/generated/prisma/
pnpm prisma migrate dev       # create + apply migration
pnpm prisma migrate deploy    # apply in prod
pnpm tsx prisma/seed.ts       # seed (uses PrismaClient with pg adapter)
```

Prisma config is at `prisma.config.ts` (not `prisma/schema.prisma` headers). The seed script loads `dotenv/config` itself. Migrations use `npx tsx prisma/seed.ts` as the seed command.

Seed creates two dashboard users: `admin@example.com / password` and `staff@example.com / password`.

## Architecture

- **Route groups:** `(public-area)` (landing, register page) and `dashboard/` (admin sidebar layout)
- **Server actions** live in `app/actions/` — each file exports `"use server"` functions. Mutations use server actions, NOT API routes.
- **API routes** exist only for Stripe webhook, checkout sessions, inscription, vehicle reconciliation — all in `app/api/`
- **Path alias:** `@/*` → project root (e.g. `@/lib/prisma`, `@/components/ui/button`)

## Prisma

- **Client output:** `app/generated/prisma/` (non-standard — must `generate` before any db work)
- **Import path:** `import prisma from "@/lib/prisma"` (singleton with `PrismaPg` adapter)
- **Schema:** `prisma/schema.prisma` — models: DashboardUser, Participant, Vehicle, Registration, RegistrationItem, Payment
- **All PKs are UUIDs** — Participant has uniques: `national_id`, `email`, `qr_token`. Vehicle: `license_plate`.
- **Migrations are committed** (in `prisma/migrations/`)

## Auth

- **Auth.js v5** is fully implemented with a Credentials provider (bcrypt against `DashboardUser` table) and JWT session strategy.
- Sign-in page: `/auth/signin`
- Session provider wraps the app in `app/providers.tsx`
- Helpers: `requireAdmin()`, `requireStaffOrAdmin()` — throw on failure.
- Route: `app/api/auth/[...nextauth]/route.ts` exports `handlers` from `auth.ts`.

## Server action pattern (widespread convention)

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }
```

The `wrapServerAction()` helper in `lib/serverActionHelpers.ts` adds auth checks and wraps `mapPrismaError()` for Prisma errors. Form actions may also throw `new Error()` directly.

## Error handling

- `lib/errors.ts` — `mapPrismaError()` translates Prisma errors to user-facing strings (Spanish for unique constraints: "Este email ya está registrado", etc.)
- P2002 (unique constraint) is the most common runtime error.

## Validation

- Zod schemas in `lib/validation/` (e.g. `ParticipantSchema`, `RegistrationSchema`, `VehicleSchema`, `CheckinSchema`)
- Partial update schemas via `.partial()` suffix.

## Key env vars (`.env`)

```
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RECONCILE_SECRET=...
AUTH_SECRET=...               # required by Auth.js v5
```

`.env` is gitignored. Stripe keys are test keys in dev.

## Stripe

- Stripe singleton at `lib/stripe.ts` — requires `STRIPE_SECRET_KEY`.
- Webhook endpoint: `POST /api/webhook/stripe` — requires `STRIPE_WEBHOOK_SECRET`.
- Checkout sessions: `GET /api/checkout` creates session, user redirected to Stripe.
- Reconciliation endpoint: `GET /api/reconcile?token=<RECONCILE_SECRET>` — syncs payment statuses.

## Dashboard pages

- `/dashboard` — KPI cards, registration chart, attendance, quick actions
- `/dashboard/participants` — CRUD with search, QR code generation
- `/dashboard/vehicles` — list with edit/delete
- `/dashboard/registrations` — orders + payments
- `/dashboard/checkin` — QR scanner + manual search
- `/dashboard/raffle` — raffle draw (checked-in cars)
- `/dashboard/settings` — ADMIN-only

## Code style

- **Prettier:** double quotes, no semicolons, trailing commas `es5`, print width 80, `prettier-plugin-tailwindcss` with `tailwindFunctions: ["cn", "cva"]`
- **ESLint:** `@typescript-eslint/no-explicit-any` is explicitly turned off in `eslint.config.mjs`.
- **CSS:** Tailwind v4 `@theme inline` block + CSS variables in `app/globals.css`. Dark mode via `.dark` class + `next-themes` `<ThemeProvider>`.
- **Icons:** `@phosphor-icons/react`
- **Tables:** `@tanstack/react-table` + custom `DataTable` component at `components/data-table.tsx`
- **Toasts:** `sonner`
- **No tests** exist in the repo.

## Perf / DB notes

- `Participant.qr_token` has a **hash index** for < 800ms scan lookups.
- `Vehicle.license_plate` has a **B-tree index**.
- `RegistrationItem.entry_number` has `@unique` and is used as raffle ticket number.
- Dashboard stats query runs ~11 Prisma queries in parallel via `Promise.all()`.
- **No real data** in the database — safe to delete/modify anything for any reason.
