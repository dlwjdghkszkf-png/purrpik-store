# Purrpik Store v3 — Multi-Pet Gate Patch

- **날짜**: 2026-05-22
- **상태**: v2 기반 인크리멘탈 변경
- **선행 spec**: `2026-05-21-purrpik-store-design-v2.md` (v2, 활성 유지)
- **변경 트리거**: 사용자 요청 — "들어가자마자 고양이/강아지/둘다 3 카드 게이트, 카테고리별 쇼핑몰 분기, 도메인 1개"

---

## 0. 핵심 결정

- **도메인**: `purrpik.co.kr` 단일 (v2 유지)
- **게이트**: `/` 진입 시 풀스크린 카드 3종 (cat / dog / both) — "당신의 반려동물은?"
- **선택 저장**: localStorage `pet_type` (cat | dog | both) → 다음 방문 시 자동 리다이렉트 (게이트 skip)
- **재선택**: 헤더에 작은 "다른 반려동물 보기" 링크 (localStorage clear + `/` 재진입)
- **카테고리별 홈**: `/cat` `/dog` `/both`
  - `/cat` = 기존 v2 홈 그대로 (푸르픽 4중 셸터 4 제품)
  - `/dog` = placeholder "강아지 신상품 준비 중" + 뉴스레터 가입 + 인스타 팔로우 유도
  - `/both` = cat+dog 호환 부속품 (현재 빈, 향후 사용자 추가)
- **카탈로그**: `/shop?pet_type=cat` 등으로 필터링. URL 기반.
- **PDP**: pet_type 라벨 표시 (mustard 작은 배지)

---

## 1. DB 변경 (`0005_pet_type.sql`)

```sql
-- Add pet_type column to products
alter table products add column pet_type text not null default 'cat'
  check (pet_type in ('cat', 'dog', 'both'));

-- 기존 4 제품은 모두 cat (default 적용)
update products set pet_type = 'cat' where id in ('basic-m','basic-l','allinone-m','allinone-l');

create index idx_products_pet_type on products(pet_type) where active = true;
```

`lib/supabase/types.ts` `products.Row`에 `pet_type: 'cat' | 'dog' | 'both'` 추가.

---

## 2. 페이지 변경

### 2.1 `/` 게이트 (변경)
v2의 `/` 홈을 `/cat`으로 이동. 새 `/`는 게이트 페이지.

- 풀스크린 (`min-h-screen flex items-center justify-center`)
- 헤더 단순 (로고만, 메뉴 X)
- 중앙 h1: "당신의 반려동물은?"
- 서브: "푸르픽이 준비한 반려동물별 큐레이션 — 카드를 선택해주세요"
- 3 카드 그리드 (`md:grid-cols-3 gap-6`):
  - **고양이** (cat): 큰 일러스트/이미지 placeholder, 카피 "4중 구조 셸터 외 고양이 전용", "보기 →" CTA
  - **강아지** (dog): "강아지 신상품 준비 중", "알림 받기 →" CTA
  - **둘 다 키워요** (both): "고양이·강아지 모두 쓸 수 있는 호환 제품", "보기 →" CTA
- 카드 클릭 → localStorage `pet_type` 저장 → 해당 카테고리 홈으로 router.push
- 하단 small link: "선택은 언제든 변경할 수 있어요"
- 자동 리다이렉트: mount 시 localStorage 체크 → 이미 저장된 pet_type 있으면 즉시 해당 홈으로 (단, query `?gate=1` 있으면 강제 게이트)

### 2.2 `/cat` 홈 (신규 — 기존 v2 `/`를 그대로 이동)
- v2 홈 컨텐츠 100% 동일 (VideoHero/EditionGrid/Layer4/TestStats/ReviewsCarousel/FaqSection/InstagramFeed/GiveBack)
- metadata: title "고양이 — 푸르픽"
- ISR `revalidate = 86400`

### 2.3 `/dog` 홈 (신규 — placeholder)
- 짧은 hero (h-[60vh] 정도): "강아지 신상품 준비 중"
- 서브: "푸르픽이 곧 강아지 라인업을 선보입니다."
- 뉴스레터 가입 폼 (큰 강조) — "출시 알림 받기"
- 인스타 팔로우 CTA
- "고양이 제품 보기 →" link (`/cat`)
- metadata: title "강아지 — 푸르픽 (준비 중)"

### 2.4 `/both` 홈 (신규)
- hero: "고양이·강아지 모두 위한 호환 제품"
- pet_type='both' 제품 grid (현재 비어있으면 "곧 출시" 메시지 + 뉴스레터)
- metadata: title "강아지&고양이 — 푸르픽"

### 2.5 `/shop` 카탈로그 (확장)
- searchParams에 `pet_type` 추가 (cat | dog | both)
- pet_type 필터 적용 (기본: 모든 카테고리, URL로 분기)
- FilterBar에 pet_type 토글 그룹 추가 (또는 페이지 진입 시 자동 적용)

### 2.6 헤더 (변경)
- 메가메뉴에 `Shelter` → `Cat` `Dog` `Both` 3 카테고리로 변경 (또는 추가)
- 현재 펫 표시 (작은 mustard 배지 — "고양이 보는 중", 클릭 시 `/?gate=1` 게이트 재진입)
- 모바일: 메뉴 안에 펫 전환 옵션

### 2.7 푸터
- "다른 반려동물 보기" link → `/?gate=1`

---

## 3. 컴포넌트 신규

- `components/gate/PetGate.tsx` — 풀스크린 카드 게이트 (Client, localStorage 체크 + redirect)
- `components/gate/PetCard.tsx` — 단일 카드
- `components/layout/PetTypeBadge.tsx` — 헤더 현재 펫 표시 + 변경 링크
- `components/dog/ComingSoonHero.tsx` — /dog placeholder hero

---

## 4. 영향 받지 않는 컴포넌트
- PDP, cart, checkout, 결제 API, Cron, Analytics, Legal, FAQ — 변경 없음
- 결제 흐름: pet_type 무관

---

## 5. 백로그 추가 (v3)
- P2-6: dog 라인업 실제 제품 추가 (사용자가 신상품 입고 시)
- P2-7: pet_type별 separate Instagram feed (현재는 통합)
- P3-5: 펫 선호 기반 추천 알고리즘 (cat 보는 사용자에게 cat 신상품 우선 노출)

---

## 6. 구현 단계

단일 Stage 17로 처리:
1. 마이그레이션 추가
2. `/` → `/cat` 컨텐츠 이전 (page.tsx 이동)
3. 새 `/` = 게이트 (PetGate 컴포넌트)
4. `/cat` `/dog` `/both` 홈 라우트 생성
5. `/shop` searchParams에 pet_type 추가
6. 헤더 PetTypeBadge + 메가메뉴 변경
7. 푸터 "다른 반려동물 보기" 추가
8. E2E 시나리오 1개 추가 (게이트 → cat 선택 → 카탈로그)

---

## 7. 변경 이력

- **2026-05-22 (v3)**: Multi-pet gate 추가. 도메인 단일 유지. localStorage 기반 펫 선호 저장 + 자동 리다이렉트. 기존 v2 홈 컨텐츠는 `/cat`으로 이전.
