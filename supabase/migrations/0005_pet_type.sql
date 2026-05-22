-- 0005_pet_type.sql
-- products.pet_type 컬럼 추가 (cat / dog / both)
-- Spec: docs/superpowers/specs/2026-05-22-purrpik-store-design-v3-multipet.md sec 1
-- 기존 4 제품(BASIC/ALL-IN-ONE × M/L)은 모두 'cat'.

alter table products add column if not exists pet_type text not null default 'cat'
  check (pet_type in ('cat', 'dog', 'both'));

-- 기존 4 제품은 모두 cat (default 적용되지만 명시).
update products set pet_type = 'cat'
  where id in ('basic-m', 'basic-l', 'allinone-m', 'allinone-l');

-- 활성 제품의 pet_type 빠른 조회 인덱스.
create index if not exists idx_products_pet_type on products(pet_type) where active = true;
