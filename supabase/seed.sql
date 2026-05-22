-- seed.sql
-- Stage 18: single master 'purrpik-shelter' + 4 SKU variants (JSONB).
-- 기존 4 별도 product row는 active=false, is_master=false로 유지(legacy SEO redirect 대응).
--
-- Sources:
--   products: ~/.claude/projects/-Users-ljh/memory/project_purrpik_product_spec.md
--   faqs:     marketing-agent/.../26_purrpik_detail.html (FAQPage JSON-LD) + 2 new
--   reviews:  synthetic, 카피톤(스펙 용어 유지, 과한 구어체 X)
--   ig:      placeholder until user provides 12 real posts
--
-- Idempotent via ON CONFLICT.

-- ============================================================
-- LEGACY PRODUCTS (4) — deactivated, 마이그 0006과 호환.
-- variants/is_master/price_min/price_max 컬럼이 0006에서 추가됨 → 시드 적용 전제.
-- ============================================================

insert into products (
  id, name, price, size_outer, size_entry, includes, edition, size_class, pet_type,
  description_html, hero_image, gallery, active, display_order,
  is_master, variants, price_min, price_max
) values
(
  'basic-m',
  '푸르픽 길고양이집 BASIC M',
  29900,
  '40×28×28cm',
  '14×18cm',
  '["본체", "극세사 담요"]'::jsonb,
  'BASIC',
  'M',
  'cat',
  '<p>옥스포드 600D + PU 코팅 외피와 알루미늄 포일·EPE 폼·TPU 4중 구조로 비·바람·지면 냉기를 차단합니다. 소형묘·협소 공간에 최적인 M 사이즈, 본체와 극세사 담요 구성.</p>',
  '/images/products/basic-m-hero.jpg',
  '["/images/products/basic-m-1.jpg","/images/products/basic-m-2.jpg","/images/products/basic-m-3.jpg"]'::jsonb,
  false, 0, false, null, null, null
),
(
  'basic-l',
  '푸르픽 길고양이집 BASIC L',
  34900,
  '50×38×38cm',
  '16×20cm',
  '["본체", "극세사 담요"]'::jsonb,
  'BASIC',
  'L',
  'cat',
  '<p>길냥이는 몸을 펼쳐 자는 경향이라 여유 공간이 필요합니다. 4중 구조 셸터의 L 사이즈, 본체와 극세사 담요 구성으로 1~2마리까지 수용 가능합니다.</p>',
  '/images/products/basic-l-hero.jpg',
  '["/images/products/basic-l-1.jpg","/images/products/basic-l-2.jpg","/images/products/basic-l-3.jpg"]'::jsonb,
  false, 1, false, null, null, null
),
(
  'allinone-m',
  '푸르픽 길고양이집 ALL-IN-ONE M',
  39900,
  '40×28×28cm',
  '14×18cm',
  '["본체", "극세사 담요", "밥그릇", "팔렛트 깔판", "쿨매트"]'::jsonb,
  'ALL_IN_ONE',
  'M',
  'cat',
  '<p>BASIC M 구성에 팔렛트 깔판·쿨매트·밥그릇이 더해진 ALL-IN-ONE M. 장마철 빗물 침투 차단(팔렛트+TPU+PU 3중 방수)과 여름철 바닥 냉각까지 한 번에 해결합니다.</p>',
  '/images/products/allinone-m-hero.jpg',
  '["/images/products/allinone-m-1.jpg","/images/products/allinone-m-2.jpg","/images/products/allinone-m-3.jpg"]'::jsonb,
  false, 2, false, null, null, null
),
(
  'allinone-l',
  '푸르픽 길고양이집 ALL-IN-ONE L',
  44900,
  '50×38×38cm',
  '16×20cm',
  '["본체", "극세사 담요", "밥그릇", "팔렛트 깔판", "쿨매트"]'::jsonb,
  'ALL_IN_ONE',
  'L',
  'cat',
  '<p>실구매자 다수가 선택한 베스트셀러. L 사이즈 본체에 팔렛트 깔판·쿨매트·밥그릇을 모두 포함. BASIC L + 팔렛트 별도 구매 대비 약 10,000원 절약, 쿨매트·밥그릇은 무료로 제공됩니다.</p>',
  '/images/products/allinone-l-hero.jpg',
  '["/images/products/allinone-l-1.jpg","/images/products/allinone-l-2.jpg","/images/products/allinone-l-3.jpg"]'::jsonb,
  false, 3, false, null, null, null
)
on conflict (id) do update set
  name             = excluded.name,
  price            = excluded.price,
  size_outer       = excluded.size_outer,
  size_entry       = excluded.size_entry,
  includes         = excluded.includes,
  edition          = excluded.edition,
  size_class       = excluded.size_class,
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
-- MASTER PRODUCT (1) — 'purrpik-shelter' + variants (JSONB)
-- 마이그 0006과 동일 데이터. on conflict do nothing 으로 중복 보호.
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
  29900,
  '40×28×28cm ~ 50×38×38cm',
  '14×18cm ~ 16×20cm',
  '["본체","극세사 담요","밥그릇","팔렛트 깔판","쿨매트"]'::jsonb,
  'BASIC',
  'M',
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
on conflict (id) do nothing;

-- ============================================================
-- FAQS (10)
-- 제품 5 / 배송 2 / 환불 2 / 돌봄 1
-- 1~8: 26_purrpik_detail.html FAQPage JSON-LD 발췌
-- 9~10: 추가 (배송 영업일 안내, 사이즈 선택 가이드)
-- ============================================================

-- 제품 (5)
insert into faqs (category, question, answer_html, display_order, active) values
('제품',
 '설치는 얼마나 걸리나요?',
 '<p>포장을 풀고 본체를 펼친 뒤 D링으로 고정하기까지 약 60초 소요됩니다. 별도 공구가 필요 없습니다.</p>',
 0, true),
('제품',
 '내구성과 하중은 어느 정도까지 견디나요?',
 '<p>자체 시험 기준 수직 하중 70kg에서 변형 0mm를 확인했습니다. 4중 구조 직조와 EPE Foam의 눌림 회복력 96%로 설계되었습니다.</p>',
 1, true),
('제품',
 '세척은 어떻게 하나요?',
 '<p>외부 옥스포드는 젖은 수건으로 닦아내면 됩니다. 내부 극세사 담요는 분리해 세탁기(찬물·울 코스) 사용이 가능합니다.</p>',
 2, true),
('제품',
 '고양이 두 마리가 함께 써도 되나요?',
 '<p>L 사이즈는 내부 모니터링 결과 1~2마리까지 수용 가능합니다. 다묘 환경이거나 6kg 이상 대형묘일 경우 L 사이즈를 권장합니다.</p>',
 3, true),
('제품',
 'KC 인증을 받았나요?',
 '<p>본 제품은 반려·길고양이 야외용 셸터로, 어린이제품안전특별법상 KC 인증 의무 대상이 아닙니다. 소재 안전성(Oxford 600D / EPE / AL Foil / TPU)은 자체 자재 시험을 거쳤습니다.</p>',
 4, true);

-- 배송 (2)
insert into faqs (category, question, answer_html, display_order, active) values
('배송',
 '배송은 얼마나 걸리나요?',
 '<p>무료배송이며 평일 15시 이전 결제 시 당일 출고됩니다. 영업일 기준 3일 이내 도착(도서산간 +2일)을 안내드립니다.</p>',
 0, true),
('배송',
 '주말·공휴일에도 출고되나요?',
 '<p>주말 및 공휴일은 출고되지 않습니다. 금요일 15시 이후 결제 건은 다음 영업일에 출고됩니다. 장마·연휴 시즌에는 사전 공지를 통해 출고 일정을 안내드립니다.</p>',
 1, true);

-- 환불 (2)
insert into faqs (category, question, answer_html, display_order, active) values
('환불',
 '환불 정책은 어떻게 되나요?',
 '<p>30일 만족 보증으로 사용 후에도 반품이 가능합니다. 톡톡 문의 → 회수 신청 → 검수 후 환불 순으로 진행되며, 단순변심 시 왕복 배송비는 판매자가 부담합니다.</p>',
 0, true),
('환불',
 '아파트 단지에 놓으면 민원 우려는 어떤가요?',
 '<p>택배박스 실루엣과 블랙 옥스포드 컬러로 시인성을 낮춰 설계했습니다. 다만 단지 관리 규정은 곳마다 다르므로 사전 확인을 권장드립니다. 민원으로 회수 시에도 30일 만족 보증 환불이 가능합니다.</p>',
 1, true);

-- 돌봄 (1) — 사이즈 선택 가이드
insert into faqs (category, question, answer_html, display_order, active) values
('돌봄',
 'M과 L 중 어떤 사이즈를 골라야 하나요?',
 '<p>길냥이는 몸을 펼쳐 자는 경향이라 여유 공간이 필요합니다. 다수 실구매자가 L(50×38×38cm)을 선택합니다. M은 좁은 골목·계단 등 협소 공간이나 소형묘(4kg 이하) 전용으로 권장드립니다. 두 마리 이상이거나 6kg 이상이면 L을 골라주세요.</p>',
 0, true);

-- ============================================================
-- REVIEWS (8)
-- allinone-l 4건 / basic-l 2건 / allinone-m 1건 / basic-m 1건
-- ============================================================

insert into reviews (product_id, rating, title, body, reviewer_name, reviewer_pet_type, photos, source, verified, display_order) values
(
  'allinone-l', 5,
  '장마철에 진가 발휘했어요',
  '7월 폭우 3일 내내 단지 화단에 두었는데 내부가 보송했습니다. 팔렛트 깔판이 빗물을 위로 떠받쳐주는 구조라 본체 바닥이 물에 닿지 않더라고요. 쿨매트는 폭염 때 효자였습니다.',
  '길냥이맘***', '길냥이',
  null, 'manual', true, 0
),
(
  'allinone-l', 5,
  '두 마리가 같이 들어가도 여유 있어요',
  'L 사이즈로 잘 골랐다 싶었어요. 입구가 좁아 보였는데 막상 고양이는 잘 드나듭니다. 알루미늄 포일 라이닝이 안에서 보이는데 단열 효과를 체감했습니다.',
  '냥이지킴이**', '길냥이',
  null, 'manual', true, 1
),
(
  'allinone-l', 4,
  '구성이 알찹니다',
  '밥그릇·쿨매트·팔렛트까지 한 번에 와서 따로 살 필요가 없었습니다. 다만 담요 색상은 랜덤이라 원하는 색이 안 올 수 있다는 점 참고하세요.',
  '캣대디***', '길냥이',
  null, 'manual', true, 2
),
(
  'allinone-l', 5,
  '민원 없이 1년째 사용 중',
  '블랙 단색이라 멀리서 보면 택배박스 같아 단지에서 별다른 지적이 없었습니다. 4중 구조 덕에 한겨울에도 따뜻하게 유지됐고, 60초 만에 설치 끝.',
  '동네언니**', '길냥이',
  null, 'manual', true, 3
),
(
  'basic-l', 5,
  '본체만으로도 충분합니다',
  '이미 쿨매트가 있어서 BASIC L로 구매했습니다. 옥스포드 600D 외피가 생각보다 두툼하고 PU 코팅으로 빗물이 또르륵 흘러내립니다. 가성비 좋습니다.',
  '길냥이가족**', '길냥이',
  null, 'manual', true, 0
),
(
  'basic-l', 4,
  '입구 사이즈 적당해요',
  '입구 16×20cm가 처음엔 작아 보였는데 4kg 후반 길냥이가 무리 없이 드나듭니다. 컴팩트한 입구가 비바람 차단에도 유리한 듯합니다.',
  '캣맘ㅇㅇ**', '길냥이',
  null, 'manual', true, 1
),
(
  'allinone-m', 5,
  '좁은 골목에 딱',
  '아파트 화단이 좁아 L은 부담스러워 M으로 골랐습니다. 소형묘 한 마리에 딱 맞는 크기. 팔렛트 깔판 덕에 본체가 지면 냉기에 노출되지 않습니다.',
  '골목냥이**', '길냥이',
  null, 'manual', true, 0
),
(
  'basic-m', 4,
  '소형묘 전용으로 좋습니다',
  '체구 작은 길냥이용으로 BASIC M 구매. 설치가 정말 60초 컷이라 놀랐습니다. 다묘 환경이라면 L 권장합니다.',
  '동네캣맘**', '길냥이',
  null, 'manual', true, 0
)
on conflict do nothing;

-- ============================================================
-- INSTAGRAM_POSTS (12 placeholders, active=false until user updates)
-- ============================================================

insert into instagram_posts (id, permalink, caption, media_url, thumbnail_url, media_type, posted_at, display_order, active) values
('IG_PLACEHOLDER_01', 'https://instagram.com/p/placeholder01', '장마 전 길냥이집 설치 현장 #푸르픽',                '/images/instagram/placeholder-01.jpg', '/images/instagram/placeholder-01-thumb.jpg', 'IMAGE', '2026-04-22 10:00:00+09', 0, false),
('IG_PLACEHOLDER_02', 'https://instagram.com/p/placeholder02', '4중 구조 단면 컷 — Layer 01~04',                  '/images/instagram/placeholder-02.jpg', '/images/instagram/placeholder-02-thumb.jpg', 'IMAGE', '2026-04-25 14:30:00+09', 1, false),
('IG_PLACEHOLDER_03', 'https://instagram.com/p/placeholder03', '팔렛트 깔판 + TPU 바닥 방수 시연',               '/images/instagram/placeholder-03.jpg', '/images/instagram/placeholder-03-thumb.jpg', 'VIDEO', '2026-04-28 11:15:00+09', 2, false),
('IG_PLACEHOLDER_04', 'https://instagram.com/p/placeholder04', '70kg 하중 시험 비하인드',                          '/images/instagram/placeholder-04.jpg', '/images/instagram/placeholder-04-thumb.jpg', 'IMAGE', '2026-04-30 09:00:00+09', 3, false),
('IG_PLACEHOLDER_05', 'https://instagram.com/p/placeholder05', '입구 사이즈 비교 — M vs L',                        '/images/instagram/placeholder-05.jpg', '/images/instagram/placeholder-05-thumb.jpg', 'IMAGE', '2026-05-02 16:00:00+09', 4, false),
('IG_PLACEHOLDER_06', 'https://instagram.com/p/placeholder06', '쿨매트 표면 온도 측정',                            '/images/instagram/placeholder-06.jpg', '/images/instagram/placeholder-06-thumb.jpg', 'CAROUSEL_ALBUM', '2026-05-04 12:00:00+09', 5, false),
('IG_PLACEHOLDER_07', 'https://instagram.com/p/placeholder07', '실구매자 후기 #리그램',                            '/images/instagram/placeholder-07.jpg', '/images/instagram/placeholder-07-thumb.jpg', 'IMAGE', '2026-05-06 19:30:00+09', 6, false),
('IG_PLACEHOLDER_08', 'https://instagram.com/p/placeholder08', '60초 설치 챌린지',                                 '/images/instagram/placeholder-08.jpg', '/images/instagram/placeholder-08-thumb.jpg', 'VIDEO', '2026-05-08 10:45:00+09', 7, false),
('IG_PLACEHOLDER_09', 'https://instagram.com/p/placeholder09', '아파트 단지 설치 가이드',                          '/images/instagram/placeholder-09.jpg', '/images/instagram/placeholder-09-thumb.jpg', 'IMAGE', '2026-05-10 13:20:00+09', 8, false),
('IG_PLACEHOLDER_10', 'https://instagram.com/p/placeholder10', '담요 4색 랜덤 — 크림/카멜/블러시/그레이',          '/images/instagram/placeholder-10.jpg', '/images/instagram/placeholder-10-thumb.jpg', 'CAROUSEL_ALBUM', '2026-05-13 15:00:00+09', 9, false),
('IG_PLACEHOLDER_11', 'https://instagram.com/p/placeholder11', '장마 D-30 도착 보장 안내',                         '/images/instagram/placeholder-11.jpg', '/images/instagram/placeholder-11-thumb.jpg', 'IMAGE', '2026-05-16 09:30:00+09', 10, false),
('IG_PLACEHOLDER_12', 'https://instagram.com/p/placeholder12', '길냥이집 사진 콘테스트 안내',                       '/images/instagram/placeholder-12.jpg', '/images/instagram/placeholder-12-thumb.jpg', 'IMAGE', '2026-05-19 18:00:00+09', 11, false)
on conflict (id) do update set
  permalink     = excluded.permalink,
  caption       = excluded.caption,
  media_url     = excluded.media_url,
  thumbnail_url = excluded.thumbnail_url,
  media_type    = excluded.media_type,
  posted_at     = excluded.posted_at,
  display_order = excluded.display_order,
  active        = excluded.active;
