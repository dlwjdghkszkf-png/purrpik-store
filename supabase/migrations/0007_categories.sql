-- ============================================
-- 0007 멀티 제품 카탈로그 — categories 트리 + products.category_id
-- 2026-06-02: 데일리 케어 라인 (수분/영양 스틱) 신규 추가
-- ============================================

-- 1) categories 테이블 (트리 구조)
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

-- 3) RLS — categories는 public read
alter table categories enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'categories' and policyname = 'categories_select_active') then
    create policy categories_select_active on categories
      for select using (active = true);
  end if;
end $$;

-- 4) 카테고리 트리 시드
insert into categories (id, parent_id, name, slug, pet_type, display_order) values
  ('cat-root',         null,            'Cats',              'cats',             'cat', 1),
  ('cat-daily-care',   'cat-root',      '데일리 케어',         'daily-care',       'cat', 1),
  ('cat-environment',  'cat-root',      '길고양이 환경',       'environment',      'cat', 2),
  ('dog-root',         null,            'Dogs',              'dogs',             'dog', 2),
  ('dog-daily-care',   'dog-root',      '데일리 케어',         'daily-care',       'dog', 1)
on conflict (id) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  slug = excluded.slug,
  pet_type = excluded.pet_type,
  display_order = excluded.display_order,
  active = true;

-- 5) 기존 길고양이집 → cat-environment 카테고리 매핑
update products
  set category_id = 'cat-environment',
      short_description = '4중 구조 야외 셸터 — 비·바람·열기 동시 차단'
  where id = 'purrpik-shelter';

-- 6) 신규 데일리 케어 제품 — 수분 스틱 (master + variants)
insert into products (
  id, name, price, edition, size_class, includes,
  pet_type, hero_image, gallery, description_html, display_order, active, is_master,
  category_id, short_description, variants, price_min, price_max
) values (
  'purrpik-hydration',
  '푸르픽 수분 스틱',
  19900,
  'MULTI', 'MULTI',
  '["수분 스틱 30개입"]'::jsonb,
  'cat',
  '/images/products/hydration-hero.jpg',
  '["/images/products/hydration-1.jpg","/images/products/hydration-2.jpg"]'::jsonb,
  '<p>매일의 수분 보충 — 수분 90% 이상, 타우린, 풍부한 육수 풍미. 깨끗한 물을 늘 챙기기 어려운 길고양이에게 한 끼의 수분까지 더합니다.</p><p>본 제품은 보조사료로, 질병의 예방·치료를 의미하지 않습니다. 국내 HACCP 인증 시설에서 제조됩니다.</p>',
  10,
  true, true,
  'cat-daily-care',
  '수분 90%+ · 타우린 · 무첨가',
  '{
    "axes": [
      {
        "id": "size",
        "label": "용량",
        "options": [
          {"id":"S","label":"30개입","sub":"기본 한 달 분량"},
          {"id":"L","label":"60개입","sub":"두 달 + 5% 추가 제공"}
        ]
      }
    ],
    "skus": [
      {"id":"hydration-s","size":"S","price":19900,"count":30},
      {"id":"hydration-l","size":"L","price":34900,"count":60}
    ]
  }'::jsonb,
  19900,
  34900
)
on conflict (id) do update set
  name = excluded.name,
  variants = excluded.variants,
  is_master = excluded.is_master,
  active = excluded.active,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  hero_image = excluded.hero_image,
  gallery = excluded.gallery,
  description_html = excluded.description_html,
  includes = excluded.includes,
  pet_type = excluded.pet_type,
  display_order = excluded.display_order;

-- 7) 신규 데일리 케어 제품 — 영양 스틱
insert into products (
  id, name, price, edition, size_class, includes,
  pet_type, hero_image, gallery, description_html, display_order, active, is_master,
  category_id, short_description, variants, price_min, price_max
) values (
  'purrpik-nutrition',
  '푸르픽 영양 스틱',
  19900,
  'MULTI', 'MULTI',
  '["영양 스틱 30개입"]'::jsonb,
  'cat',
  '/images/products/nutrition-hero.jpg',
  '["/images/products/nutrition-1.jpg","/images/products/nutrition-2.jpg"]'::jsonb,
  '<p>마른 길고양이의 기력 보충 — 고단백 닭가슴살·참치 배합. 수분 스틱과 짝을 이루는 케어의 다른 한 축입니다.</p><p>본 제품은 보조사료로, 질병의 예방·치료를 의미하지 않습니다. 국내 HACCP 인증 시설에서 제조됩니다.</p>',
  11,
  true, true,
  'cat-daily-care',
  '고단백 · 닭가슴살·참치 · 무첨가',
  '{
    "axes": [
      {
        "id": "size",
        "label": "용량",
        "options": [
          {"id":"S","label":"30개입","sub":"기본 한 달 분량"},
          {"id":"L","label":"60개입","sub":"두 달 + 5% 추가 제공"}
        ]
      }
    ],
    "skus": [
      {"id":"nutrition-s","size":"S","price":19900,"count":30},
      {"id":"nutrition-l","size":"L","price":34900,"count":60}
    ]
  }'::jsonb,
  19900,
  34900
)
on conflict (id) do update set
  name = excluded.name,
  variants = excluded.variants,
  is_master = excluded.is_master,
  active = excluded.active,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  hero_image = excluded.hero_image,
  gallery = excluded.gallery,
  description_html = excluded.description_html,
  includes = excluded.includes,
  pet_type = excluded.pet_type,
  display_order = excluded.display_order;

-- 8) 데일리 듀오 세트 (수분 + 영양 묶음)
insert into products (
  id, name, price, edition, size_class, includes,
  pet_type, hero_image, gallery, description_html, display_order, active, is_master,
  category_id, short_description, variants, price_min, price_max
) values (
  'purrpik-duo',
  '푸르픽 데일리 듀오 세트',
  29900,
  'MULTI', 'MULTI',
  '["수분 스틱 30개입","영양 스틱 30개입"]'::jsonb,
  'cat',
  '/images/products/duo-hero.jpg',
  '["/images/products/duo-1.jpg"]'::jsonb,
  '<p>매일 한 쌍, 데일리 듀오. 수분으로 채우고, 영양으로 더합니다. 7일 케어 루틴의 시작.</p><p>본 제품은 보조사료로, 질병의 예방·치료를 의미하지 않습니다.</p>',
  9,
  true, true,
  'cat-daily-care',
  '하루 한 쌍 · 수분 + 영양',
  '{
    "axes": [
      {
        "id": "size",
        "label": "용량",
        "options": [
          {"id":"S","label":"각 30개입","sub":"기본 한 달 분량"},
          {"id":"L","label":"각 60개입","sub":"두 달 + 5% 추가 제공"}
        ]
      }
    ],
    "skus": [
      {"id":"duo-s","size":"S","price":29900,"count":60},
      {"id":"duo-l","size":"L","price":49900,"count":120}
    ]
  }'::jsonb,
  29900,
  49900
)
on conflict (id) do update set
  name = excluded.name,
  variants = excluded.variants,
  is_master = excluded.is_master,
  active = excluded.active,
  price_min = excluded.price_min,
  price_max = excluded.price_max,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  hero_image = excluded.hero_image,
  gallery = excluded.gallery,
  description_html = excluded.description_html,
  includes = excluded.includes,
  pet_type = excluded.pet_type,
  display_order = excluded.display_order;

-- 9) 검증
select c.id, c.name, c.pet_type, count(p.id) as product_count
  from categories c
  left join products p on p.category_id = c.id and p.active = true
  group by c.id, c.name, c.pet_type
  order by c.pet_type, c.display_order;
