# Setup guide — Dance Fit with Emily booking system

This walks you from a fresh clone to taking a real test payment. No prior Stripe or
Supabase setup is assumed. Follow the steps in order.

There are three things to configure: **the database (Supabase)**, **payments (Stripe)**,
and **the admin login**. They all live in a file called `.env`.

---

## 0. Install

```bash
npm install
```

Copy the example env file (a `.env` may already exist with placeholders):

```bash
cp .env.example .env
```

You'll edit `.env` in the steps below.

---

## 1. Database — Supabase (Postgres)

1. Go to <https://supabase.com> and create a free account, then **New project**.
   Pick a name and a strong database password (save it).
2. When the project is ready, open **Project Settings → Database → Connection string**.
3. You need **two** connection strings:
   - **Transaction pooler** (port **6543**) → this is your `DATABASE_URL`.
     Make sure it ends with `?pgbouncer=true`.
   - **Session / direct connection** (port **5432**) → this is your `DIRECT_URL`.
4. Paste both into `.env`, replacing the placeholders. They look like:

   ```
   DATABASE_URL="postgresql://postgres.abcd:YOURPASSWORD@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.abcd:YOURPASSWORD@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
   ```

5. Create the database tables:

   ```bash
   npx prisma migrate dev --name init
   ```

   You should see it create the `Booking` table. (You can browse data anytime with
   `npx prisma studio`, or in the Supabase **Table editor**.)

---

## 2. Payments — Stripe

1. Go to <https://stripe.com> and create an account. You can use **Test mode** (toggle
   top-right) for everything below — no real money moves.
2. Open **Developers → API keys**. Copy:
   - **Publishable key** (`pk_test_…`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (`sk_test_…`) → `STRIPE_SECRET_KEY`
3. Paste both into `.env`.

### Webhook (so paid bookings update automatically)

**For local development**, install the Stripe CLI (<https://docs.stripe.com/stripe-cli>),
then run:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

It prints a signing secret like `whsec_…`. Put that in `.env` as `STRIPE_WEBHOOK_SECRET`.
Keep this command running in a second terminal while you test.

> Even without the webhook running, the app self-heals: opening a booking re-checks
> Stripe and updates its status. The webhook just makes it instant.

**For production**, in the Stripe dashboard go to **Developers → Webhooks → Add endpoint**,
set the URL to `https://yourdomain.com/api/webhooks/stripe`, subscribe to
`payment_intent.succeeded`, `payment_intent.processing`, `payment_intent.payment_failed`,
and `payment_intent.canceled`, then copy that endpoint's signing secret into your
production `STRIPE_WEBHOOK_SECRET`.

---

## 3. Admin login

In `.env`:

- `ADMIN_PASSWORD` — the password you'll type to sign in.
- `AUTH_SECRET` — a long random string that signs the login session. Generate one:

  ```bash
  openssl rand -base64 32
  ```

---

## 4. Run it

```bash
npm run dev
```

Open <http://localhost:3000/admin> and sign in with `ADMIN_PASSWORD`.

### Test the whole flow

1. **Create a class** — tap **+ New class**, fill in the dance type, date/time, price,
   and (optionally) a capacity, then save.
2. You'll land on the class page with a **join link**. Tap **Copy link** (or **Share** on
   your phone) — or **Open page** to preview what attendees see.
3. Open that link (this is the public join page). Enter a name/email/phone, then pay with
   the Stripe **test card**:
   - Number `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.
4. You'll see a confirmation, and the person appears as **Paid** on the class roster — the
   "joined" count and collected total update. Repeat with the same link to add more people.
5. To record someone who paid **in cash**, use **Add attendee** on the class page.

Other useful test cards: `4000 0000 0000 0002` (declined),
`4000 0025 0000 3155` (requires authentication).

---

## 5. Going live

When you're ready to take real payments:

1. Switch Stripe to **live** keys (`pk_live_…` / `sk_live_…`) in your production env.
2. Set `NEXT_PUBLIC_BASE_URL` to your real domain (used to build payment links).
3. Add the **production webhook endpoint** in Stripe and use its signing secret.
4. Deploy (e.g. Vercel). Run `npx prisma migrate deploy` against the Supabase project.
   Use the pooled `DATABASE_URL` for the app and `DIRECT_URL` only for migrations.

That's it — the admin can now create bookings on their phone and send branded payment
links, with no manual work in the Stripe dashboard.
