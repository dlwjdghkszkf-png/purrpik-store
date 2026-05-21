-- 0003_newsletter_ig.sql
-- newsletter_subscribers + instagram_posts

create table if not exists newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  consent_at      timestamptz not null,
  source          text,                  -- 'footer' | 'checkout' | 'popup'
  unsubscribed_at timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_newsletter_email on newsletter_subscribers(email);

create table if not exists instagram_posts (
  id             text primary key,        -- IG media id
  permalink      text not null,
  caption        text,
  media_url      text not null,
  thumbnail_url  text,
  media_type     text not null,           -- 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  posted_at      timestamptz,
  display_order  int not null default 0,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  constraint instagram_media_type_check check (media_type in ('IMAGE','VIDEO','CAROUSEL_ALBUM'))
);

create index if not exists idx_instagram_active_order
  on instagram_posts(active, display_order);
