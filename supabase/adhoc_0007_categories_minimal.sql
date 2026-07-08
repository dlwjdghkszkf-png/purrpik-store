-- ============================================
-- 0007 최소 적용 — 카테고리 스키마 + 현재 상품 2개 매핑만
-- 2026-07-08: prod DB에 categories 반영. 0007 원본의 스틱 상품 3개(수분/영양/듀오)는
--             아직 미제작(이미지 없음)이라 제외. 준비되면 별도 추가.
-- 적용 방법: Supabase 대시보드 → SQL Editor → 아래 전체 붙여넣기 → Run
-- ============================================

-- 1) categories 테이블 (트리)
create table if not exists categories (
  id            text primary key,
  parent_id     text references categories(id) on delete cascade,
  name          text not null,
  slug          text not null,
  pet_type      text not null check (pet_type in ('cat', 'dog', 'both')),
  display_order int  not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists idx_categories_parent on categories(parent_id);
create index if not exists idx_categories_pet_type_active on categories(pet_type, active, display_order);
create unique index if not exists ux_categories_slug_pet on categories(slug, pet_type);

-- 2) products 신규 컬럼
alter table products add column if not exists category_id text references categories(id);
alter table products add column if not exists short_description text;
create index if not exists idx_products_category_active on products(category_id, active, display_order);

-- 3) RLS — categories public read
alter table categories enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'categories' and policyname = 'categories_select_active') then
    create policy categories_select_active on categories
      for select using (active = true);
  end if;
end $$;

-- 4) 카테고리 트리 (현재 쓰는 것만: 고양이 환경 / 강아지 침구)
insert into categories (id, parent_id, name, slug, pet_type, display_order) values
  ('cat-root',        null,       'Cats',        'cats',        'cat', 1),
  ('cat-environment', 'cat-root', '길고양이 환경', 'environment', 'cat', 2),
  ('dog-root',        null,       'Dogs',        'dogs',        'dog', 2),
  ('dog-bedding',     'dog-root', '침구/매트',     'bedding',     'dog', 2)
on conflict (id) do update set
  parent_id = excluded.parent_id, name = excluded.name, slug = excluded.slug,
  pet_type = excluded.pet_type, display_order = excluded.display_order, active = true;

-- 5) 현재 상품 2개 카테고리 매핑 + short_description
update products set
  category_id = 'cat-environment',
  short_description = '4중 구조 야외 셸터 — 비·바람·열기 동시 차단'
  where id = 'purrpik-shelter';

update products set
  category_id = 'dog-bedding',
  short_description = 'FITI 접촉냉감 인증 · 4면밴딩 · 국내산 듀라론'
  where id = 'purrpik-coolmat';

-- 6) 무통장입금 지원 — orders에 결제수단 컬럼 (card | bank_transfer)
alter table orders add column if not exists payment_method text not null default 'card';

-- 7) 검증 (카테고리별 상품 수)
select c.id, c.name, c.pet_type, count(p.id) as product_count
  from categories c
  left join products p on p.category_id = c.id and p.active = true
  group by c.id, c.name, c.pet_type
  order by c.pet_type, c.display_order;
