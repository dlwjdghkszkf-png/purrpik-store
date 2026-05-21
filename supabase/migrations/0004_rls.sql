-- 0004_rls.sql
-- Row Level Security policies
-- Service role bypasses RLS automatically; only anon/authenticated keys are constrained here.

alter table products                enable row level security;
alter table orders                  enable row level security;
alter table reviews                 enable row level security;
alter table faqs                    enable row level security;
alter table newsletter_subscribers  enable row level security;
alter table instagram_posts         enable row level security;

-- products: anon can read active rows only
drop policy if exists products_anon_select on products;
create policy products_anon_select on products
  for select to anon
  using (active = true);

-- orders: no anon policy at all. Server-only via service role.
-- (RLS enabled with zero policies => anon/authenticated get nothing.)

-- reviews: anon can read all (MVP shows all rows)
drop policy if exists reviews_anon_select on reviews;
create policy reviews_anon_select on reviews
  for select to anon
  using (true);

-- faqs: anon can read active rows only
drop policy if exists faqs_anon_select on faqs;
create policy faqs_anon_select on faqs
  for select to anon
  using (active = true);

-- newsletter_subscribers: server-only (privacy — emails never exposed to anon)
-- No policies => anon cannot read/write. /api/newsletter/subscribe uses service role.

-- instagram_posts: anon can read active rows only
drop policy if exists instagram_anon_select on instagram_posts;
create policy instagram_anon_select on instagram_posts
  for select to anon
  using (active = true);
