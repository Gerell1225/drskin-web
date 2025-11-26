# DrSkin & DrHair Web

Next.js 15 + TypeScript + Tailwind dashboard and landing page for DrSkin & DrHair. Uses an in-memory repository today with Supabase placeholder ready.

## Getting started

```bash
npm install
npm run dev
```

Lint and tests:

```bash
npm run lint
npm run test
```

## Environment

Set the following when wiring Supabase and QPay:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `QPAY_USERNAME`
- `QPAY_PASSWORD`
- `QPAY_INVOICE_CODE`

## Repository swap

All admin panels import from `src/components/admin/repo.ts`. To switch to Supabase once ready, change that import to `repo.supabase.ts` — both files share the same API surface.
