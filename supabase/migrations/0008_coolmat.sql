-- ============================================
-- 0008 강아지 침구 카테고리 + 국내산 듀라론 쿨매트 신규 상품
-- 2026-07-07: 국내 위탁판매 파일럿 1호 (딱펫 소싱, 원제조사 패션독/LIPPY)
-- ============================================

-- 1) 강아지 침구 카테고리 신설
insert into categories (id, parent_id, name, slug, pet_type, display_order) values
  ('dog-bedding', 'dog-root', '침구/매트', 'bedding', 'dog', 2)
on conflict (id) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  slug = excluded.slug,
  pet_type = excluded.pet_type,
  display_order = excluded.display_order,
  active = true;

-- 2) 국내산 듀라론 강아지쿨매트 (master + 4 SKU)
-- 가격: 딱펫 원가 + 배송비 4,000원 합산 기준 마진 40% (무료배송 통합가)
insert into products (
  id, name, price, edition, size_class, includes,
  pet_type, hero_image, gallery, description_html, display_order, active, is_master,
  category_id, short_description, variants, price_min, price_max
) values (
  'purrpik-coolmat',
  '푸르픽 국내산 듀라론 강아지쿨매트',
  20900,
  'MULTI', 'MULTI',
  '["국내산 듀라론 강아지쿨매트 1매"]'::jsonb,
  'dog',
  '/images/products/coolmat-hero.jpg',
  '["/images/products/coolmat-1.jpg","/images/products/coolmat-2.jpg","/images/products/coolmat-3.jpg","/images/products/coolmat-4.jpg"]'::jsonb,
  '<img src="/images/products/coolmat-detail/01.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/02.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/03.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/04.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/05.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/06.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/07.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/08.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/09.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/10.jpg" style="width:100%;display:block"><img src="/images/products/coolmat-detail/11.jpg" style="width:100%;display:block">',
  20,
  true, true,
  'dog-bedding',
  'FITI 접촉냉감 인증 · 4면밴딩 · 국내산 듀라론',
  '{
    "axes": [
      {
        "id": "size",
        "label": "사이즈",
        "options": [
          {"id":"S","label":"소형 (40×55cm)","sub":"소형견·반려묘 추천"},
          {"id":"M","label":"중형 (50×62cm)","sub":"중형견 추천"},
          {"id":"L","label":"대형 (53×82cm)","sub":"대형견·사람 겸용"},
          {"id":"XL","label":"초대형 (70×120cm)","sub":"중대형견·사람 겸용 침구"}
        ]
      }
    ],
    "skus": [
      {"id":"coolmat-s","size":"S","price":20900},
      {"id":"coolmat-m","size":"M","price":25900},
      {"id":"coolmat-l","size":"L","price":36900},
      {"id":"coolmat-xl","size":"XL","price":45900}
    ]
  }'::jsonb,
  20900,
  45900
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

-- 3) 검증
select c.id, c.name, c.pet_type, count(p.id) as product_count
  from categories c
  left join products p on p.category_id = c.id and p.active = true
  group by c.id, c.name, c.pet_type
  order by c.pet_type, c.display_order;
