-- 0006_master_variants.sql
-- Stage 18 — single master product + 4 SKU variants 리팩.
-- 기존 4 별도 products (basic-m/basic-l/allinone-m/allinone-l) → deactivate.
-- 신규 1 master product 'purrpik-shelter' + variants JSONB (2 axes × 4 SKU).
-- Spec: ~/.claude/projects/-Users-ljh/memory/project_purrpik_product_spec.md

-- ============================================================
-- 1) products 컬럼 추가
-- ============================================================
alter table products
  add column if not exists variants    jsonb,
  add column if not exists is_master   boolean not null default false,
  add column if not exists price_min   int,
  add column if not exists price_max   int;

-- 마스터 빠른 조회 인덱스.
create index if not exists idx_products_master_active
  on products(active, display_order) where is_master = true;

-- ============================================================
-- 2) 기존 4 row deactivate (legacy id, /shop/[id] redirect로 SEO 보존)
-- ============================================================
update products
  set active = false
  where id in ('basic-m','basic-l','allinone-m','allinone-l');

-- ============================================================
-- 3) 마스터 row UPSERT
--    edition/size_class은 NOT NULL check 제약 (BASIC|ALL_IN_ONE, M|L)이라
--    placeholder로 'BASIC'/'M' 사용. 실제 표시는 variants에서 결정.
-- ============================================================
insert into products (
  id, name, price, size_outer, size_entry,
  includes, edition, size_class, pet_type,
  description_html, hero_image, gallery,
  active, display_order, is_master,
  variants, price_min, price_max
) values (
  'purrpik-shelter',
  '푸르픽 길고양이집',
  29900,                                        -- 기본 표시 가격 (최저가)
  '40×28×28cm ~ 50×38×38cm',                    -- range (마스터 placeholder)
  '14×18cm ~ 16×20cm',
  '["본체","극세사 담요","밥그릇","팔렛트 깔판","쿨매트"]'::jsonb,
  'BASIC',                                      -- placeholder (variant에서 결정)
  'M',                                          -- placeholder
  'cat',
  '<p>4중 구조(Oxford 600D · AL Foil · EPE Foam 5mm · TPU)로 비·바람·열기·바닥을 동시에 차단하는 길고양이 야외 보호 셸터. 60초 설치, 자체 시험 기준 수직 하중 70kg 변형 0mm, 자외선 99% 차단.</p>',
  '/images/products/purrpik-shelter-hero.jpg',
  '["/images/products/purrpik-shelter-1.jpg","/images/products/purrpik-shelter-2.jpg","/images/products/purrpik-shelter-3.jpg"]'::jsonb,
  true,
  0,
  true,
  '{
    "axes": [
      {
        "id": "edition",
        "label": "에디션",
        "options": [
          {"id":"BASIC","label":"BASIC","sub":"본체 + 담요"},
          {"id":"ALL_IN_ONE","label":"ALL-IN-ONE","sub":"본체 + 담요 + 밥그릇 + 팔렛트 깔판 + 쿨매트"}
        ]
      },
      {
        "id": "size",
        "label": "사이즈",
        "options": [
          {"id":"M","label":"M","sub":"40×28×28cm · 입구 14×18cm"},
          {"id":"L","label":"L","sub":"50×38×38cm · 입구 16×20cm (실구매자 다수)"}
        ]
      }
    ],
    "skus": [
      {"id":"basic-m","edition":"BASIC","size":"M","price":29900,"size_outer":"40×28×28cm","size_entry":"14×18cm","includes":["본체","극세사 담요"]},
      {"id":"basic-l","edition":"BASIC","size":"L","price":34900,"size_outer":"50×38×38cm","size_entry":"16×20cm","includes":["본체","극세사 담요"]},
      {"id":"allinone-m","edition":"ALL_IN_ONE","size":"M","price":39900,"size_outer":"40×28×28cm","size_entry":"14×18cm","includes":["본체","극세사 담요","밥그릇","팔렛트 깔판","쿨매트"]},
      {"id":"allinone-l","edition":"ALL_IN_ONE","size":"L","price":44900,"size_outer":"50×38×38cm","size_entry":"16×20cm","includes":["본체","극세사 담요","밥그릇","팔렛트 깔판","쿨매트"]}
    ]
  }'::jsonb,
  29900,
  44900
)
on conflict (id) do update set
  name             = excluded.name,
  price            = excluded.price,
  size_outer       = excluded.size_outer,
  size_entry       = excluded.size_entry,
  includes         = excluded.includes,
  pet_type         = excluded.pet_type,
  description_html = excluded.description_html,
  hero_image       = excluded.hero_image,
  gallery          = excluded.gallery,
  active           = excluded.active,
  display_order    = excluded.display_order,
  is_master        = excluded.is_master,
  variants         = excluded.variants,
  price_min        = excluded.price_min,
  price_max        = excluded.price_max;

-- ============================================================
-- 4) orders.variant_id (nullable, 기존 호환)
-- ============================================================
alter table orders add column if not exists variant_id text;

-- ============================================================
-- 5) reviews — 기존 legacy product 리뷰를 마스터로 이전
--    (variant별 리뷰 분리는 P2 — review.variant_id 추가)
-- ============================================================
update reviews
  set product_id = 'purrpik-shelter'
  where product_id in ('basic-m','basic-l','allinone-m','allinone-l');
