-- Per-table RLS policies, layered on top of supabase/enable-rls.sql.
--
-- Design principle: every WRITE in this app goes through an API route that
-- enforces business-logic integrity (live pricing in the trade route, the
-- 10-free-analyses cap, no-short-selling, etc.). None of that logic lives in
-- the database. So these policies intentionally grant SELECT only, scoped to
-- the owning user — never INSERT/UPDATE/DELETE — so a valid Supabase JWT can
-- never be used to hit PostgREST directly and bypass those checks (e.g.
-- inserting a fake trade with a fabricated price, or writing virtualCash
-- directly into portfolios).
--
-- stock_cache is the one exception: it's just a mirror of public market data
-- (quotes/history), not user data, so public SELECT is fine. rate_limits is
-- pure internal bookkeeping with no legitimate client read/write case, so it
-- gets no policies at all (fully denied, same as before).
--
-- Run via: psql/node script against DATABASE_URL, same as enable-rls.sql.

-- users: can see your own profile row only.
create policy "users_select_own" on public.users
  for select
  using (id = auth.uid()::text);

-- watchlist_items: full CRUD on your own rows (matches GET/POST/DELETE in /api/watchlist).
create policy "watchlist_select_own" on public.watchlist_items
  for select
  using ("userId" = auth.uid()::text);

create policy "watchlist_insert_own" on public.watchlist_items
  for insert
  with check ("userId" = auth.uid()::text);

create policy "watchlist_delete_own" on public.watchlist_items
  for delete
  using ("userId" = auth.uid()::text);

-- price_alerts: read/create/delete your own (matches GET/POST/DELETE in /api/alerts).
-- No update policy — the app never edits an existing alert, only creates/deletes.
create policy "price_alerts_select_own" on public.price_alerts
  for select
  using ("userId" = auth.uid()::text);

create policy "price_alerts_insert_own" on public.price_alerts
  for insert
  with check ("userId" = auth.uid()::text);

create policy "price_alerts_delete_own" on public.price_alerts
  for delete
  using ("userId" = auth.uid()::text);

-- portfolios: read-only. virtualCash is only ever mutated by the trade route's
-- server-computed cash delta — never write this directly.
create policy "portfolios_select_own" on public.portfolios
  for select
  using ("userId" = auth.uid()::text);

-- trades: read-only, scoped via the owning portfolio. Trades are immutable
-- history written exclusively by the trade route (live price, validated qty).
create policy "trades_select_own" on public.trades
  for select
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = trades."portfolioId" and p."userId" = auth.uid()::text
    )
  );

-- positions: read-only, scoped via the owning portfolio. averageCost/PnL are
-- derived values maintained by the trade route, not directly writable.
create policy "positions_select_own" on public.positions
  for select
  using (
    exists (
      select 1 from public.portfolios p
      where p.id = positions."portfolioId" and p."userId" = auth.uid()::text
    )
  );

-- analyses: read your own analyses only. Anonymous analyses (userId null)
-- aren't tied to any account so they stay inaccessible via this policy.
-- No insert policy — analyses are created server-side after enforcing the
-- free-tier usage cap; allowing direct inserts would let users bypass it.
create policy "analyses_select_own" on public.analyses
  for select
  using ("userId" = auth.uid()::text);

-- stock_cache: not user data — just a cache of public market quotes/history.
-- Safe to expose for read; only the server (Prisma) ever writes to it.
create policy "stock_cache_select_all" on public.stock_cache
  for select
  using (true);

-- rate_limits: no policies — purely internal, no legitimate client access at all.
