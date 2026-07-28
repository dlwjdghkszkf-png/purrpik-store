-- 0009_order_items.sql
-- P0-2 (REVIEW_SOL_QA_2026-07-28): 복수 카트 라인 주문 상세 보존.
-- orders = 주문 헤더 (기존 product_id/quantity/amount 컬럼은 첫 라인 스냅샷으로 유지 — 하위 호환).
-- order_items = 라인별 상품/옵션/단가/수량 스냅샷 (서버 계산 가격만 저장).

create table if not exists order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    text not null references products(id),
  variant_id    text,
  product_name  text not null,          -- 주문 시점 상품명 스냅샷
  variant_label text,                   -- 주문 시점 옵션 라벨 스냅샷 (예: "BASIC · M")
  unit_price    int  not null check (unit_price >= 0),
  quantity      int  not null check (quantity > 0),
  line_total    int  not null check (line_total >= 0),
  created_at    timestamptz not null default now()
);

create index if not exists idx_order_items_order on order_items(order_id);

-- RLS: 정책 없이 enable = anon/authenticated 전면 차단. service role만 접근.
alter table order_items enable row level security;
