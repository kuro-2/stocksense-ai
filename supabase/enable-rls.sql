-- Enable Row Level Security on every table.
--
-- Context: the app's API routes talk to Postgres directly via Prisma using
-- DATABASE_URL (the `postgres` role), which owns these tables and is NOT
-- subject to RLS. The app never queries these tables through the Supabase
-- client / PostgREST.
--
-- However, Supabase auto-exposes every table over its public REST API
-- (PostgREST), gated only by the anon key — which is a NEXT_PUBLIC_* value
-- shipped to every browser. With RLS disabled (the default), anyone holding
-- that public anon key can read/write any row in any table directly via
-- https://<project>.supabase.co/rest/v1/<table>, completely bypassing this
-- app's auth checks.
--
-- Since legitimate access only ever happens through Prisma (which bypasses
-- RLS as the table owner), enabling RLS with NO policies is sufficient: it
-- denies all access via the anon/authenticated PostgREST roles while leaving
-- the app fully functional.
--
-- Run this once in the Supabase SQL editor (or via `psql "$DATABASE_URL" -f supabase/enable-rls.sql`).

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Also force RLS for the table owner itself, in case DATABASE_URL ever points
-- at a non-owner role (e.g. if you switch to Supabase connection pooling
-- under a different role later). Harmless no-op for the current setup since
-- Prisma's `postgres` role owns these tables and FORCE doesn't apply to owners
-- unless you are a superuser bypassing BYPASSRLS — left commented out by
-- default to avoid surprises; uncomment if you tighten the DB role later.
-- ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
