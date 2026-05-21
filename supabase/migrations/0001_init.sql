-- 0001_init.sql
-- products + orders tables
-- Spec: docs/superpowers/specs/2026-05-21-purrpik-store-design-v2.md sec 7.1

create table if not exists products (
  id              text primary key,
  name            text not null,
  price           int not null,
  size_outer      text,
  size_entry      text,
  includes        jsonb not null,
  edition         text not null,           -- 'BASIC' | 'ALL_IN_ONE'
  size_class      text not null,           -- 'M' | 'L'
  description_html text,                   -- PDP body (Korean)
  hero_image      text,                    -- /images/products/...
  gallery         jsonb,                   -- ["url1", "url2", ...]
  active          boolean not null default true,
  display_order   int not null default 0,  -- /shop sort order
  created_at      timestamptz not null default now(),
  constraint products_edition_check check (edition in ('BASIC', 'ALL_IN_ONE')),
  constraint products_size_class_check check (size_class in ('M', 'L'))
);

create index if not exists idx_products_active_order
  on products(active, display_order);

create table if not exists orders (
  id                uuid primary key default gen_random_uuid(),
  order_no          text unique not null,           -- 사용자 식별용 주문번호 (lib/orderNo.ts)
  product_id        text not null references products(id),
  quantity          int not null check (quantity > 0),
  amount            int not null,                   -- 결제 금액 (원)
  buyer_name        text not null,
  buyer_phone       text not null,
  buyer_email       text,
  ship_zipcode      text not null,
  ship_address1     text not null,
  ship_address2     text,
  ship_memo         text,
  status            text not null default 'pending', -- 'pending' | 'paid' | 'shipping' | 'delivered' | 'cancelled' | 'failed'
  toss_payment_key  text,
  toss_order_id     text,
  toss_paid_at      timestamptz,
  alimtalk_sent_at  timestamptz,
  alimtalk_attempts int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint orders_status_check check (status in ('pending','paid','shipping','delivered','cancelled','failed'))
);

create index if not exists idx_orders_order_no on orders(order_no);
create index if not exists idx_orders_status_created on orders(status, created_at desc);
create index if not exists idx_orders_buyer_email on orders(buyer_email);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_orders_set_updated_at on orders;
create trigger trg_orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();
