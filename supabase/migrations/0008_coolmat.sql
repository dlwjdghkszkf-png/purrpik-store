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
  '<p>휴비스 정품 DURARON® 냉감원단 + FITI 시험연구원 접촉냉감 테스트 통과 인증서를 확보한 국내산 강아지쿨매트입니다. 4면 밴딩과 후면 미끄럼방지 처리로 세탁을 반복해도 밀림이 없고, 소형부터 초대형까지 4단계 실측 사이즈로 우리 아이 몸에 맞게 고를 수 있습니다.</p><p>상세 이미지는 아래 "상품 상세정보"에서 확인하세요.</p>',
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
