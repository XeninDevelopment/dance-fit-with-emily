# Dance Fit with Emily — booking system

A mobile-first booking system for dance classes. The admin (on their phone) creates a
**class** and gets **one shareable link**; multiple people open that link, enter their
details, and **pay to join** on a branded page that looks like part of the site — no manual
work in the Stripe dashboard. A Stripe webhook marks each attendee **Paid**, and the admin
sees the live roster per class.

## How it works

```
Admin (phone) ─▶ /admin/new ─▶ creates a Class ─▶ shareable /class/{token} join link
Customer ─▶ /class/{token} ─▶ enters name/email/phone ─▶ pays (Stripe Payment Element)
         └▶ Stripe webhook ─▶ attendee marked PAID ─▶ roster updates on /admin
```

The admin can also add someone who paid in cash, and set an optional capacity per class.

## Tech

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4** — mobile-first
- **Stripe Payment Element** embedded on our own pages (not Stripe-hosted), via PaymentIntents
- **Prisma 7** + **Supabase (Postgres)** via the `@prisma/adapter-pg` driver adapter
- **jose** for an Edge-safe signed admin session cookie; **zod** for input validation

## Quick start

See **[SETUP.md](./SETUP.md)** for the full walkthrough (Supabase, Stripe, admin login).
In short:

```bash
npm install
cp .env.example .env      # then fill in the values (see SETUP.md)
npx prisma migrate dev    # once DATABASE_URL/DIRECT_URL are set
npm run dev               # open http://localhost:3000/admin
```

Test card: `4242 4242 4242 4242`, any future expiry / CVC.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/admin/*` | Admin login, classes dashboard, new-class form, class roster |
| `app/class/[token]/*` | Public join + pay page and post-payment status |
| `app/api/classes/*` | Create/delete classes, add manual (cash) attendees — admin only |
| `app/api/join/[token]` | Public: join a class (creates a booking + Stripe PaymentIntent) |
| `app/api/bookings/[id]` | Remove an attendee (admin only) |
| `app/api/webhooks/stripe` | Verifies and processes Stripe events |
| `app/api/auth/*` | Admin login / logout |
| `proxy.ts` | Guards `/admin/*` and the admin `/api/classes`, `/api/bookings` APIs |
| `lib/*` | Stripe, Prisma, auth, money, datetime helpers |
| `prisma/schema.prisma` | The `Class` and `Booking` models |

## Configuration

All config is in `.env` (see `.env.example`). The studio/brand name is
`NEXT_PUBLIC_SITE_NAME` and the default currency is `DEFAULT_CURRENCY` — change them in
one place.
