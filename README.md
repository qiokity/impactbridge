# ImpactBridge

ImpactBridge is a privacy-aware charity and community-impact platform for India. It supports transparent campaigns, goods sharing, community reports, education requests, volunteering, and reviewed emergency assistance. The application uses Next.js, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and cookie-backed password authentication.

> **Development data and payments:** Seeded records are fictional demonstration content. The local payment flow is clearly simulated and is excluded from genuine fundraising totals. Do not use this project to collect or distribute funds until legal, banking, tax, provider, security, and operational requirements have been independently reviewed.

## Implementation plan and current status

The work is deliberately split into small, testable phases:

1. **Foundation — in progress:** application shell, design system, strict TypeScript, security headers, Prisma schema, environment validation, authentication primitives, documentation, and demo seed data.
2. **Core platform — in progress:** public campaign discovery, organization membership checks, role-aware dashboards, moderation records, and audit logging.
3. **Service workflows — in progress:** database-backed campaign, goods, community, education, volunteer, emergency, expense, and notification records with public/private visibility filters.
4. **Financial workflow — in progress:** append-only donation and expense ledger, a simulated local provider, Razorpay order/webhook verification primitives, and idempotent provider-event storage.
5. **Completion work — outstanding:** complete secure upload/storage adapter, password reset/email verification delivery, full Razorpay checkout and reconciliation/refunds, richer moderator actions, pagination, integration/E2E tests, legal review, production observability, and a deployment review.

The code does not represent unimplemented integrations as successful. See [Known limitations](#known-limitations-and-required-external-configuration).

## Local setup

Prerequisites: Node.js compatible with the installed Next.js release, npm, and a local PostgreSQL server. The intended database is named `impactbridge`.

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Create the local database and a least-privilege local role using your PostgreSQL administrator account. For example, create a database named `impactbridge`; do not run this against a production database.

3. Create a local environment file and fill in values:

   ```bash
   cp .env.example .env
   ```

   Generate `AUTH_SECRET` with `openssl rand -base64 48`. Use a development-only `DEMO_SEED_PASSWORD` of at least 12 characters. `.env` is gitignored and must never be committed.

4. Generate the Prisma client and apply the checked-in development migration:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Seed clearly labelled fictional content:

   ```bash
   npm run db:seed
   ```

6. Run the app:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`. The seed process prints the demonstration account emails, but never a password. Use the `DEMO_SEED_PASSWORD` you set locally.

## Quality checks

Run these before opening a change for review:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run db:migrate` applies schema changes to the database named in `DATABASE_URL`. It is intentionally not part of the automated quality commands and must never point to production without a reviewed migration plan and backup.

## Authentication and initial administrator

- New sign-ups can only create a `SUPPORTER` account. Browser input cannot set a privileged role.
- Sessions use signed, HTTP-only cookies plus a hashed, server-side session token. Passwords are bcrypt-hashed.
- For local bootstrap only, set both `INITIAL_ADMIN_EMAIL` and `INITIAL_ADMIN_PASSWORD` before running `npm run db:seed`. The seed script creates or updates that account as `ADMIN` and does not print its password.
- In a real deployment, use a protected, audited bootstrap procedure and remove bootstrap secrets after use.

## Payments

Without Razorpay credentials, donations use a development-only simulated adapter. Simulated donations are explicitly labelled and excluded from genuine fundraising calculations.

For Razorpay test mode, configure all three server-only values:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

The webhook endpoint is `/api/webhooks/razorpay`. Configure it in the provider dashboard only after the application is deployed over HTTPS. The server validates webhook HMAC signatures and stores provider events idempotently. A production checkout UI, provider-side reconciliation, and refund initiation remain outstanding; do not enable live collection until those are implemented and reviewed.

## Storage and email

The schema supports public assets and private evidence, but a production S3-compatible storage adapter and signed download URLs are not yet wired. Do not upload sensitive documents to this development deployment.

Email configuration is reserved for a transactional provider. Until an adapter is configured, the application must not claim that verification or notification email was delivered.

## Known limitations and required external configuration

- Legal templates in the site require review by qualified counsel before production.
- Organization verification, moderation, and demo records are application workflow states, not claims of real-world verification or authority approval.
- Community reports are not government submissions.
- This project is not an emergency service, payment institution, tax advisor, or logistics provider.
- Production still needs managed PostgreSQL, private object storage, email provider, Redis/distributed rate limiting, error monitoring, backups/recovery, restrictive CSP review, domain/HTTPS, and provider/legal approval.
- Integration and end-to-end tests require a dedicated disposable PostgreSQL test database; never run test cleanup against production.

## Deployment outline

Use a hosting provider compatible with Next.js plus managed PostgreSQL and private S3-compatible object storage. Set production environment variables in the provider’s secret manager, run reviewed migrations as a release step, configure least-privilege storage policies and Razorpay webhooks, enable HTTPS, monitor errors and payment reconciliation, back up the database, and document tested rollback/secret-rotation procedures.
