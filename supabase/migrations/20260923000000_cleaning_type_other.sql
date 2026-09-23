-- Adds the 'other' cleaning type used by custom (unpriced) quote requests.
-- Kept in its own migration: Postgres refuses to use a new enum value in the
-- same transaction that added it, and the Supabase CLI runs one transaction
-- per migration file.

alter type public.cleaning_type add value if not exists 'other';
