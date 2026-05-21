# Purrpik Store — 자사몰 설계 스펙 (v2)

- **날짜**: 2026-05-21
- **상태**: 사용자 리뷰 대기 → writing-plans 이행
- **출처**: brainstorming v1 + Wild One 벤치마크 재구성
- **선행 spec**: `2026-05-20-purrpik-store-design.md` (v1, deprecated)
- **벤치마크**: https://wildone.com (구조·UX·미니멀 톤)

---

## 0. 컨텍스트 (v1에서 변경 없음)

- **제품**: 푸르픽 길고양이집 4-tier (BASIC M/L 29,900~34,900원, ALL-IN-ONE M/L 39,900~44,900원)
- **기존 채널**: 스마트스토어 + 쿠팡 운영 중 (자산 풍부, `/Users/ljh/Documents/marketing-agent/workspace/campaigns/2026-04-20_길고양이집/`)
- **자사몰 목적**: 광고 깔때기 + 브랜드 신뢰 + 풀 D2C 경험 (Wild One 벤치)
- **도메인**: `purrpik.co.kr` (가비아 구매 완료, 2026-05-20)
- **제약**: 사업자등록증·통신판매업신고증 ✓, 토스 가맹 미신청

---

## 1. v1 → v2 핵심 변경

| 항목 | v1 | v2 |
|---|---|---|
| 페이지 수 | 2 | **13+** |
| 히어로 | 정적 이미지 | **풀스크린 영상 (자료 수령 후 교체, 임시 포스터 이미지 + Ken Burns)** |
| 메가메뉴 | 없음 | **있음 (Shelter 호버 시 4 에디션)** |
| 카트 | 없음 (LP→checkout 직행) | **슬라이드 드로어 + /cart 페이지** |
| 카탈로그 | 없음 | **/shop** |
| PDP | 없음 (LP 통합) | **/shop/[edition]** (4개) |
| 리뷰 | P2 백로그 | **MVP — /reviews + LP·PDP 섹션** |
| FAQ | LP 섹션 | **LP 섹션 + /faq 별도** |
| 브랜드 | 없음 | **/about + /care-guide + /give-back** |
| 인스타 임베드 | P3 백로그 | **MVP — 푸터 위 피드** |
| 뉴스레터 | 없음 | **푸터 "Join the Pack" 폼** |
| 출시 절차 | 최소 MVP 3~5일 | **풀 자사몰 일괄 4~6주** |
| 회원·적립금·정기배송·쿠폰 | 풀세트 백로그 | **P2 백로그 유지** (Wild One도 회원·적립 없이 운영) |

---

## 2. 기술 스택 (v1 유지)

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, RSC) |
| DB | Supabase Postgres + RLS |
| 배포 | Vercel + Cron |
| 스타일 | Tailwind v4 + shadcn/ui |
| 결제 | TossPayments 결제위젯 v2 |
| 알림톡 | 솔라피 (CoolSMS) |
| 폰트 | Pretendard Variable (단일) + 헤딩 GmarketSans Bold (강조용 옵션) |
| 인스타 | Instagram Basic Display API 또는 수기 캐시 (MVP는 수기) |
| 비디오 | `<video autoplay muted loop playsinline poster>` + HLS 옵션 (대용량 시 Mux/Cloudflare Stream) |

---

## 3. 비주얼 톤 (Wild One 벤치 적용)

- **방향**: 모던 미니멀 + 에디토리얼 라이프스타일 (Wild One 톤)
- **베이스**: 화이트 `#ffffff` · 텍스트 `#0a0a0a` · 그레이 `#525252` `#737373` `#e5e5e5`
- **액센트**: 머스터드 `#c17a1f` 단일 (CTA·강조·배지에만)
- **이미지**: 자연광 라이프스타일 사진 + 일반 가정·골목 배경 (편집 매거진)
- **카피·이미지·구조화 데이터**: 기존 캠페인 폴더 자산 재사용 (`/Users/ljh/Documents/marketing-agent/workspace/campaigns/2026-04-20_길고양이집/`)

---

## 4. 페이지 구조 (라우트 — v2 풀세트)

| # | 경로 | 역할 | 렌더링 |
|---|---|---|---|
| 1 | `/` | 영상 히어로 + 에디션 그리드 + 4중구조 시연 + 테스트 수치 + 리뷰 + FAQ + 인스타 + Give Back + Footer | RSC (ISR 24h) |
| 2 | `/shop` | 카탈로그 (4 에디션 + 필터: M/L · BASIC/ALL-IN-ONE) | RSC |
| 3 | `/shop/[edition]` | PDP — 메인 영상/이미지 → 옵션 → 4중구조 단면 → 자재·치수 → 리뷰 → FAQ → CTA | RSC + Client (옵션 선택) |
| 4 | `/cart` | 카트 페이지 (드로어로도 노출) | Client |
| 5 | `/checkout` | 배송지 폼 + 토스 위젯 | Client |
| 6 | `/checkout/success` | 결제 승인 + 주문번호 + 알림톡 발송 | RSC + Server Action |
| 7 | `/checkout/fail` | 결제 실패 | RSC |
| 8 | `/reviews` | 전체 리뷰 갤러리 (사진 + 별점 + 필터) | RSC (ISR 1h) |
| 9 | `/faq` | FAQ 전체 (카테고리별) | RSC |
| 10 | `/about` | 브랜드 스토리 | RSC |
| 11 | `/care-guide` | 길냥이 돌봄 가이드 (SEO 콘텐츠) | RSC |
| 12 | `/give-back` | 길냥이 보호 메시지 + (P2) 기부 연계 | RSC |
| 13 | `/orders/lookup` | 비회원 주문조회 | Client + Server Action |
| 14~16 | `/(legal)/privacy` `/terms` `/business-info` | 법적 페이지 | RSC |
| API | `/api/payments/confirm` | 토스 결제 검증 + DB + 알림톡 | Route Handler |
| API | `/api/alimtalk/retry` | 미발송 알림톡 재시도 (Cron `*/5 * * * *`) | Route Handler |
| API | `/api/orders/cleanup` | 24h 경과 pending 정리 (Cron `0 3 * * *`) | Route Handler |
| API | `/api/instagram/sync` | (옵션) 인스타 피드 캐시 갱신 (Cron `0 */6 * * *`) | Route Handler |

---

## 5. 헤더 / 메가메뉴 / 푸터 (Wild One 패턴)

### 5.1 상단 프로모 배너 (슬라이드)
- 3개 메시지 회전: "장마 D-XX 도착 보장" / "전제품 무료배송" / "30일 만족보증"
- 배경 다크잉크 `#0a0a0a`, 텍스트 화이트, 12px

### 5.2 헤더 (Sticky)
- **좌**: 메가메뉴 — `Shelter` (호버 시 4 에디션 + 이미지 배너) · `Reviews` · `Care Guide` · `About`
- **중앙**: 푸르픽 로고 (워드마크)
- **우**: Search 아이콘 · Order Lookup 링크 · Cart 아이콘 (counter)

### 5.3 메가메뉴 — Shelter
```
┌────────────────────────────────────────────────────────┐
│  BY EDITION                  │  FEATURED                │
│  · BASIC M                   │  [ALL-IN-ONE L 이미지]   │
│  · BASIC L                   │  실구매자 다수 선택       │
│  · ALL-IN-ONE M              │                          │
│  · ALL-IN-ONE L              │  [4중 구조 단면 이미지]  │
│                              │  Layer 01~04 살펴보기     │
└────────────────────────────────────────────────────────┘
```

### 5.4 미니카트 (슬라이드 드로어)
- 우측에서 슬라이드 인
- 상품 썸네일 + 옵션 + 수량 + 가격 + 삭제
- 합계 + "장바구니 보기" + "결제하기" + "쇼핑 계속하기"

### 5.5 푸터 (3컬럼)

| Shop | Info | Help |
|---|---|---|
| 전체 상품 | 브랜드 스토리 | 고객 문의 |
| BASIC M/L | 길냥이 돌봄 가이드 | FAQ |
| ALL-IN-ONE M/L | 리뷰 | 배송 · 교환 · 환불 |
| Give Back | 인스타그램 | 주문 조회 |

**Join the Pack 뉴스레터**: 이메일 + 동의 체크 + 가입 버튼 (Supabase `newsletter_subscribers` 테이블)
**소셜**: Instagram (@purrpik) · Facebook
**법적**: 사업자정보 · 개인정보처리방침 · 이용약관 · 통신판매업신고증
**Cookie 배너** (개인정보보호법 2026-09-11 시행 대비): 행태정보 수집 동의

---

## 6. 영상 히어로 (자료 수령 후 교체)

### 6.1 임시 구현 (영상 자료 받기 전)
- `<video>` 태그 자리만 만들고 영상 src 없음
- `poster` 속성으로 기존 캠페인 IMG-01 (장마 전야 골목 이미지) 사용
- Ken Burns CSS 효과 (`transform: scale(1) → scale(1.08)` 8초 무한 알터네이트)
- 영상 도착 즉시 `/public/videos/hero.mp4` 파일 추가 + src 1줄 추가

### 6.2 정식 구현
```tsx
<video
  poster="/images/hero-poster.jpg"
  autoPlay muted loop playsInline
  preload="metadata"
  className="w-full h-screen object-cover"
>
  <source src="/videos/hero-1080p.mp4" type="video/mp4" />
  <source src="/videos/hero-720p.mp4" type="video/mp4" media="(max-width: 768px)" />
</video>
```

### 6.3 영상 최적화
- 모바일 720p (≤3MB), 데스크탑 1080p (≤8MB)
- 30초 이하 무한 루프
- 오디오 트랙 제거
- 첫 프레임 = 포스터 이미지 매칭

### 6.4 영상 자료 수령 체크리스트 (사용자 작업)
- [ ] 가로 16:9 + 세로 9:16 두 컷 (데스크탑/모바일)
- [ ] 30초 이하
- [ ] 첫 1초 인상 강함 (cropped autoplay 대비)
- [ ] 푸르픽 셸터 + 실제 길냥이 (가능 시) 또는 셸터 단독 디테일 컷

---

## 7. 데이터 모델 (v2 확장)

### 7.1 신규 / 변경 테이블

```sql
-- products: v1과 동일하되 description, hero_image, gallery 추가
create table products (
  id text primary key,
  name text not null,
  price int not null,
  size_outer text,
  size_entry text,
  includes jsonb not null,
  edition text not null,           -- 'BASIC' | 'ALL_IN_ONE'
  size_class text not null,        -- 'M' | 'L'
  description_html text,           -- PDP 본문
  hero_image text,                 -- /public/images/...
  gallery jsonb,                   -- ["url1", "url2", ...]
  active boolean default true,
  display_order int default 0,     -- /shop 정렬
  created_at timestamptz default now()
);

-- orders: v1과 동일
-- (v2-2 회원 도입 시 user_id 컬럼 추가)

-- reviews: 신규
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text references products(id),
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  reviewer_name text,              -- 닉네임 (마스킹된 실명)
  reviewer_pet_type text,          -- '길냥이' | '집냥이' | '강아지' 등
  photos jsonb,                    -- ["url1", "url2", ...]
  source text default 'manual',    -- 'manual' | 'instagram' | 'imported'
  verified boolean default false,  -- 실제 구매자 검증 여부 (수기)
  display_order int default 0,
  created_at timestamptz default now()
);
create index idx_reviews_product on reviews(product_id, display_order desc);

-- newsletter_subscribers: 신규
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  consent_at timestamptz not null,
  source text,                     -- 'footer' | 'checkout' | 'popup'
  unsubscribed_at timestamptz,
  created_at timestamptz default now()
);

-- instagram_posts: 신규 (수기 캐시 — Instagram Display API는 P2)
create table instagram_posts (
  id text primary key,             -- IG media id
  permalink text not null,
  caption text,
  media_url text not null,
  thumbnail_url text,
  media_type text not null,        -- 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  posted_at timestamptz,
  display_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

-- faqs: 신규 (다중 페이지 노출용)
create table faqs (
  id uuid primary key default gen_random_uuid(),
  category text not null,          -- '제품' | '배송' | '환불' | '돌봄'
  question text not null,
  answer_html text not null,
  display_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);
```

### 7.2 RLS
- `products`, `reviews`, `faqs`, `instagram_posts`: anon SELECT (`active=true` 또는 published 컬럼)
- `orders`, `newsletter_subscribers`: server-only

---

## 8. 결제 흐름 · 에러 처리 · 보안 (v1 유지)
v1 spec sec 5·6·12 그대로 적용. 변경 없음.

---

## 9. 테스팅 (v1 + PDP·카트·리뷰 추가)

- **토스 테스트 모드**: TEST 키
- **E2E (Playwright)**: 다음 시나리오 5개
  1. `/` → 메가메뉴 호버 → `/shop/allinone-l` → 옵션 선택 → "장바구니" → 드로어 확인 → "결제하기" → success
  2. `/shop` → 필터 ALL-IN-ONE → 카드 클릭 → PDP → CTA
  3. `/reviews` → 사진 필터 → 리뷰 카드 클릭 → 상세
  4. `/orders/lookup` → 이메일+주문번호 입력 → 결과 표시
  5. 푸터 뉴스레터 가입 → 동의 → DB 확인
- **Unit**: confirm route (성공·금액불일치·멱등성·토스실패)
- **시각 회귀**: Playwright screenshot diff (메인 페이지 5개)

---

## 10. MVP scope (출시 1차 — v2 풀세트 일괄 4~6주)

### 10.1 P1-A 페이지 (1~2주)
- [ ] `/` 홈 (영상 히어로 placeholder + 모든 섹션)
- [ ] `/shop` 카탈로그
- [ ] `/shop/[edition]` PDP 4개
- [ ] `/cart` + 드로어 미니카트
- [ ] `/checkout` + 토스 위젯
- [ ] `/checkout/success` `/checkout/fail`
- [ ] `/reviews`
- [ ] `/faq`
- [ ] `/about` `/care-guide` `/give-back`
- [ ] `/orders/lookup`
- [ ] 법적 페이지 3개

### 10.2 P1-B 시스템 (1~2주, 페이지와 병행)
- [ ] 헤더 메가메뉴 + 프로모 배너 슬라이드
- [ ] 푸터 + 뉴스레터 가입
- [ ] Supabase 마이그레이션 + 시드 (products 4 + faqs 10 + reviews 8 + ig_posts 12)
- [ ] `/api/payments/confirm`
- [ ] 솔라피 알림톡 helper + 템플릿
- [ ] Vercel Cron 3개
- [ ] GA4 + Meta Pixel 통합
- [ ] Sentry

### 10.3 P1-C 마무리 (1~2주)
- [ ] E2E + Unit 테스트
- [ ] 도메인 연결 + 토스 가맹 신청 후 실 결제 검증
- [ ] 영상 자료 수령 시 src 교체
- [ ] 광고 깔때기 GA 이벤트 검증

---

## 11. 백로그 (P2/P3 — MVP 출시 후)

| 우선순위 | 기능 |
|---|---|
| P2-1 | Supabase Auth 회원가입 · 로그인 (이메일 + 카카오 OAuth) |
| P2-2 | 적립금 시스템 |
| P2-3 | 쿠폰 · 프로모코드 |
| P2-4 | 자동 리뷰 임포트 (구매자 후기 이메일 → 리뷰 등록 flow) |
| P2-5 | Instagram Basic Display API 정식 통합 (현 MVP는 수기 캐시) |
| P3-1 | 정기배송 (계절 부속 — 쿨매트 → 단열패드) |
| P3-2 | 굿즈 / 추가 상품 (스크래쳐 · 사료볼) |
| P3-3 | 기부 연계 (give-back 실제 캠페인) |
| P3-4 | Mux/Cloudflare Stream 비디오 호스팅 (현 MVP는 정적 파일) |

---

## 12. 폴더 구조 (v2 확장)

```
purrpik-store/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                       # 홈
│  ├─ shop/
│  │  ├─ page.tsx                    # 카탈로그
│  │  └─ [edition]/page.tsx          # PDP
│  ├─ cart/page.tsx
│  ├─ checkout/
│  │  ├─ page.tsx
│  │  ├─ success/page.tsx
│  │  └─ fail/page.tsx
│  ├─ reviews/page.tsx
│  ├─ faq/page.tsx
│  ├─ about/page.tsx
│  ├─ care-guide/page.tsx
│  ├─ give-back/page.tsx
│  ├─ orders/lookup/page.tsx
│  ├─ (legal)/
│  │  ├─ privacy/page.tsx
│  │  ├─ terms/page.tsx
│  │  └─ business-info/page.tsx
│  └─ api/
│     ├─ payments/confirm/route.ts
│     ├─ alimtalk/retry/route.ts
│     ├─ orders/cleanup/route.ts
│     ├─ instagram/sync/route.ts
│     └─ newsletter/subscribe/route.ts
├─ components/
│  ├─ layout/                        # Header, MegaMenu, PromoBar, Footer, MiniCartDrawer
│  ├─ home/                          # VideoHero, EditionGrid, Layer4, TestStats, ReviewsCarousel, InstagramFeed, GiveBack
│  ├─ shop/                          # ProductCard, FilterBar
│  ├─ pdp/                           # Gallery, OptionPicker, SpecTable, ReviewsSection, FaqSection, AddToCartButton
│  ├─ cart/                          # CartLine, CartSummary
│  ├─ checkout/                      # AddressForm, TossWidget
│  ├─ reviews/                       # ReviewCard, ReviewFilter, PhotoLightbox
│  ├─ faq/                           # FaqAccordion, FaqCategoryNav
│  └─ ui/                            # shadcn/ui generated
├─ lib/
│  ├─ supabase/server.ts
│  ├─ supabase/client.ts
│  ├─ cart/store.ts                  # Zustand or React Context (cart state)
│  ├─ toss.ts
│  ├─ solapi.ts
│  ├─ orderNo.ts
│  └─ analytics.ts                   # GA4 + Meta Pixel events
├─ supabase/
│  ├─ migrations/
│  │  ├─ 0001_init.sql               # products + orders
│  │  ├─ 0002_reviews_faqs.sql       # reviews + faqs
│  │  ├─ 0003_newsletter_ig.sql      # newsletter_subscribers + instagram_posts
│  │  └─ 0004_rls.sql                # all RLS policies
│  └─ seed.sql                       # products 4 + faqs 10 + reviews 8 + ig_posts 12
├─ public/
│  ├─ images/                        # 캠페인 폴더에서 복사
│  └─ videos/                        # 영상 자료 (사용자 수령 후 추가)
├─ docs/
├─ vercel.json                       # Cron 4개
└─ ... (나머지 v1과 동일)
```

---

## 13. 환경 변수 (v1 + 추가)

```bash
# v1 동일 변수 외에 추가:
NEXT_PUBLIC_INSTAGRAM_HANDLE=purrpik   # @purrpik
NEWSLETTER_DOUBLE_OPTIN=true           # 더블 옵트인 여부
```

---

## 14. 컴플라이언스 (v1 + Cookie 배너 추가)

| 법규 | 적용 |
|---|---|
| 전자상거래법 다크패턴 5유형 금지 (2026-02-14) | 사전선택 X · 가격 1회 · 취소 명확 |
| 개인정보보호법 개정 (2026-09-11) | **Cookie 동의 배너 (GA·Pixel 활성화 사전 동의)** — Onetrust 또는 자체 구현 |
| 표시광고법 시행령 개정 (2026) | 자체 시험 수치 명시 (70kg 등) |
| 공정위 추천보증 심사지침 | 인스타 임베드 + 리뷰 임포트 시 광고 표시 첫 부분 |
| 카카오 알림톡 정책 | 템플릿 사전 등록 + 카카오 심사 1~2일 |
| 뉴스레터 (정보통신망법) | 마케팅 수신 동의 별도 체크박스 · 수신 거부 링크 의무 |

---

## 15. 출시 체크리스트 (v2)

### 사용자 직접 작업
- [x] 가비아 도메인 `purrpik.co.kr` (2026-05-20 완료)
- [ ] Supabase 프로젝트 생성 (한국 리전)
- [ ] Vercel 프로젝트 + env
- [ ] 가비아 DNS → Vercel
- [ ] 토스페이먼츠 가맹 신청 (사이트 임시 배포 후)
- [ ] 솔라피 가입 + API Key
- [ ] 카카오 비즈채널 + 알림톡 템플릿 등록
- [ ] GA4 + Meta Pixel 발급
- [ ] **영상 자료 제공** (가로 16:9 + 세로 9:16, 30초 이하, 720/1080p)
- [ ] 인스타 @purrpik 계정 운영 + 최신 게시물 12개 URL (수기 캐시용)

### 구현 작업 (writing-plans에서 상세화)
- 위 10.1~10.3 P1-A/B/C 체크리스트 그대로

---

## 16. 변경 이력

- **2026-05-21 (v2)**: Wild One 벤치마크 도입. 단일 LP → 풀 자사몰 13페이지. 영상 히어로 (placeholder 시작). 메가메뉴·드로어카트·리뷰·인스타·뉴스레터·브랜드 페이지 추가. 출시 절차 4~6주.
- **2026-05-20 (v1, deprecated)**: 최초 brainstorming. 단일 LP+체크아웃 가설.
