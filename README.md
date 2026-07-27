# Lane Club

## Run the frontend

```powershell
pnpm install
pnpm dev
```

## Backend setup

The app uses Supabase for authentication, PostgreSQL, and API authorization. Stripe is used only by server-side Edge Functions for recurring owner billing.

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`, then add the project URL and anonymous key.
3. In the Supabase SQL editor, run `supabase/migrations/202607260001_initial_schema.sql`.
4. Deploy the Edge Functions in `supabase/functions` and set the Stripe secret values there. Never add Stripe secret keys to frontend environment files.
5. Configure the Stripe webhook to call `stripe-webhook` after the function is deployed.

The database function `create_reservation` rejects double-booked lanes and reservations that would exceed a member's four-hour weekly allowance.
