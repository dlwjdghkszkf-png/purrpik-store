# Purrpik Store v1 — Implementation Plan

- **Feature**: 푸르픽 자사몰 v1 (Wild One 벤치, 풀세트 13페이지)
- **날짜**: 2026-05-21
- **출처 spec**: `docs/superpowers/specs/2026-05-21-purrpik-store-design-v2.md`
- **상태**: subagent-driven-development 인계 준비

---

## Executive Summary

| 관점 | 요약 |
|---|---|
| **Problem** | 푸르픽 길고양이집 D2C 자사몰 부재. 광고 깔때기·브랜드 컨트롤·장기 컨버전 데이터 누적 채널 없음. |
| **Solution** | Wild One 벤치 모던 미니멀 풀 자사몰. Next.js 16 + Supabase + Vercel + TossPayments + 솔라피 알림톡. 13 페이지 + 4 API + 4 Cron + 메가메뉴/드로어카트/리뷰/인스타/뉴스레터. |
| **Function/UX** | 영상 히어로(placeholder→교체) · 메가메뉴 · 슬라이드 드로어 카트 · 4중구조 시연 · UGC 리뷰 · 인스타 피드 · 비회원 결제 · 알림톡 · Cookie 배너. |
| **Core Value** | 광고 깔때기 최적화 + 스마트스토어와 톤 분리(프리미엄 D2C) + 5년 누적 비용 최저 + 풀 디자인 컨트롤 + 회원·적립금 P2 백로그로 MVP 부담 ↓. |

---

## 0. Intent (spec v2 sec 0에서 confirmed)

- **핵심 문제**: 스마트스토어·쿠팡 외 자체 채널로 광고 깔때기 운영 및 브랜드 컨트롤
- **타깃 사용자**: 광고 유입 일반 소비자 (한국 D2C 첫 구매자, 길냥이 돌봄·집사·예비입양자)
- **성공 기준**: 광고 → 결제까지 단일 깔때기 운영 가능, 7일 내 첫 결제, 4주 내 100건 이상

## 1. Alternatives (spec v2에서 결정 완료)

- ✅ 채택: **Wild One 벤치 풀 자사몰** (단일 LP 대비 13페이지 확장)
- 기각: 단일 LP+체크아웃 (v1, deprecated) / SaaS 카페24 / Shopify
- 기각 사유: 광고 LP + 브랜드 컨트롤 + 장기 비용 trade-off 검토 후 자체 빌드 풀 자사몰 선택

## 2. YAGNI Review (MVP scope vs 백로그 분리 완료)

### 포함 (MVP P1)
홈 · /shop · /shop/[edition] · /cart · /checkout(success/fail) · /reviews · /faq · /about · /care-guide · /give-back · /orders/lookup · legal 3 · 메가메뉴 · 드로어카트 · 영상히어로 placeholder · 리뷰 · 인스타 수기 캐시 · 뉴스레터 · Cookie 배너 · 알림톡 · GA4 · Meta Pixel · Sentry

### 미포함 (P2/P3 백로그)
회원가입·로그인 · 적립금 · 쿠폰·프로모코드 · 자동 리뷰 임포트 · Instagram API 정식 통합 · 정기배송 · 추가 상품 · 기부 실제 캠페인 · Mux 비디오 호스팅

---

## 3. Architecture

### 3.1 시스템 구성

```
[광고 유입]
   ↓
[Vercel CDN] → Next.js 16 RSC (홈/Shop/PDP/Static)
   ↓                                ↓
[Supabase Postgres + RLS]      [Client (Cart Drawer, Toss Widget)]
   ↓                                ↓
[Vercel Cron]                  [TossPayments 결제위젯]
   ↓                                ↓
[솔라피 알림톡]                  [/api/payments/confirm]
                                    ↓
                              [DB orders update + 알림톡 트리거]
                                    ↓
                              [GA4 + Meta Pixel 이벤트]
```

### 3.2 데이터 흐름 — 결제

(spec v2 sec 5.1 참조 — 멱등성 보장 7단계)

### 3.3 클라이언트 상태

| 영역 | 도구 |
|---|---|
| 카트 (장바구니) | Zustand (persist localStorage) |
| 드로어 open 상태 | Zustand |
| Cookie consent | Zustand (persist) |

---

## 4. 구현 단계 (Stage 0~16) + 의존성

### 의존성 그래프

```
Stage 0 (프로젝트 셋업)
   ↓
Stage 1 (디자인 시스템)
   ↓
Stage 2 (DB 마이그레이션 + 시드)
   ↓
Stage 3 (Layout: Header/Footer/Drawer/Cookie)
   ↓
   ├─→ Stage 4 (홈 /)
   ├─→ Stage 5 (/shop)
   ├─→ Stage 11 (정적 페이지 6개)
   └─→ Stage 12 (뉴스레터 API)
        ↓
        Stage 6 (/shop/[edition] PDP)  ← Stage 5 의존
            ↓
            Stage 7 (/cart)
                ↓
                Stage 8 (/checkout + Toss widget)
                    ↓
                    Stage 9 (결제 API + 알림톡)
                        ↓
                        Stage 10 (/checkout/success, /fail)
                            ↓
                            Stage 13 (Cron 4개)
                                ↓
                                Stage 14 (GA4/Pixel/Sentry)
                                    ↓
                                    Stage 15 (테스트 — E2E + Unit + 시각회귀)
                                        ↓
                                        Stage 16 (배포 준비)
```

### Stage 0 — 프로젝트 셋업 (1~2h, 1~2K 토큰)

**TODO**
- [ ] Bun + Next.js 16 init (`bunx create-next-app@latest --typescript --tailwind --app --src-dir=false --import-alias="@/*"`)
- [ ] Tailwind v4 (next.config + globals.css)
- [ ] shadcn/ui init (`bunx shadcn@latest init`)
- [ ] Pretendard Variable 폰트 (`app/layout.tsx`에 CDN link)
- [ ] `.env.example` (spec v2 sec 13)
- [ ] `.gitignore` 보강 (`.next/`, `.vercel/`, `node_modules/`, `.env*`, `!.env.example`)
- [ ] Supabase CLI 로컬 (`supabase init`)
- [ ] `lib/supabase/server.ts` + `lib/supabase/client.ts` 스켈레톤
- [ ] 루트 `app/layout.tsx` metadata + viewport

**Acceptance**: `bun dev` 정상 기동, 빈 Next.js 페이지 + Pretendard 폰트 적용 확인.

### Stage 1 — 디자인 시스템 (2~3h, 3~4K 토큰)

**TODO**
- [ ] Tailwind config: 컬러 토큰 (`brand-mustard: #c17a1f`, `ink: #0a0a0a`, `mute: #525252/#737373`, `line: #e5e5e5`)
- [ ] 타이포 스케일 (h1 48/64, h2 32/40, h3 24/32, body 16/24, small 14)
- [ ] shadcn 컴포넌트 추가: button, input, select, dialog, sheet, accordion, separator, label, checkbox, radio-group, scroll-area, badge, card
- [ ] `components/ui/` 변형 — Wild One 톤에 맞춰 button.variants 수정 (default = 블랙 fill / outline = 라인)
- [ ] 글로벌 reset + container max-w-7xl mx-auto

**Acceptance**: 컬러·타이포·버튼·인풋 데모 페이지 (`app/_design-system/page.tsx` — gitignore 안 함, dev 참고용) 정상 렌더.

### Stage 2 — DB 마이그레이션 + 시드 (3~4h, 5~6K 토큰)

**TODO**
- [ ] `supabase/migrations/0001_init.sql` — products + orders + 인덱스
- [ ] `supabase/migrations/0002_reviews_faqs.sql` — reviews + faqs
- [ ] `supabase/migrations/0003_newsletter_ig.sql` — newsletter_subscribers + instagram_posts
- [ ] `supabase/migrations/0004_rls.sql` — RLS 정책 전체
- [ ] `supabase/seed.sql` — products 4건 + faqs 10건(캠페인 26_purrpik_detail.html에서 추출) + reviews 8건 + instagram_posts 12건 placeholder
- [ ] `bunx supabase db reset` 로컬 검증

**Acceptance**: 로컬 Supabase에서 4 테이블 + RLS 동작, anon으로 products SELECT 가능, orders SELECT 불가.

### Stage 3 — Layout 컴포넌트 (4~6h, 6~8K 토큰)

**TODO**
- [ ] `components/layout/PromoBar.tsx` — 3개 슬라이드 회전 (CSS animation, 5초 간격)
- [ ] `components/layout/Header.tsx` — sticky, 로고 중앙, 메가메뉴 좌, 우 아이콘
- [ ] `components/layout/MegaMenu.tsx` — Shelter 호버 시 4 에디션 + 이미지 배너
- [ ] `components/layout/MiniCartDrawer.tsx` — shadcn Sheet 기반
- [ ] `components/layout/Footer.tsx` — 3컬럼 + 뉴스레터 폼 + 소셜 + 법적
- [ ] `components/layout/CookieBanner.tsx` — 화면 하단 sticky, accept/decline
- [ ] `lib/cart/store.ts` — Zustand (items, addItem, removeItem, updateQty, clear, isOpen)
- [ ] `app/layout.tsx` 통합

**Acceptance**: 빈 페이지에서 헤더·푸터·프로모바·쿠키배너·드로어 토글 정상 동작.

### Stage 4 — 홈 (`/`) (6~8h, 8~10K 토큰)

**TODO**
- [ ] `components/home/VideoHero.tsx` — `<video poster autoPlay muted loop playsInline>` + src 없을 시 poster + Ken Burns CSS
- [ ] `components/home/EditionGrid.tsx` — 4 카드 그리드 (이미지 + 이름 + 가격 + CTA)
- [ ] `components/home/Layer4.tsx` — 4중구조 단면도 (스크롤 인터랙티브 가능)
- [ ] `components/home/TestStats.tsx` — 자외선99% / 하중70kg / 60초설치 / 내수압3000mm
- [ ] `components/home/ReviewsCarousel.tsx` — Supabase reviews 8건 캐러셀
- [ ] `components/home/FaqSection.tsx` — Supabase faqs 5건 (LP용 우선 노출)
- [ ] `components/home/InstagramFeed.tsx` — instagram_posts 12 그리드
- [ ] `components/home/GiveBack.tsx` — 길냥이 보호 메시지 배너
- [ ] `app/page.tsx` — RSC, ISR revalidate 86400
- [ ] 카피·이미지는 `/Users/ljh/Documents/marketing-agent/workspace/campaigns/2026-04-20_길고양이집/`에서 가져옴 (23_detail_page_skeleton.md, 22_purrpik_prompts_expert_style.md, 26_purrpik_detail.html)

**Acceptance**: 데스크탑·모바일 정상 렌더, 영상 자리에 포스터 이미지 + Ken Burns 효과, 모든 섹션 카피 한국어, 메가메뉴/카트 정상.

### Stage 5 — `/shop` 카탈로그 (3~4h, 4~5K 토큰)

**TODO**
- [ ] `components/shop/ProductCard.tsx` — 이미지 + 이름 + 가격 + "보기" 링크
- [ ] `components/shop/FilterBar.tsx` — M/L + BASIC/ALL-IN-ONE 토글 (URL searchParams)
- [ ] `app/shop/page.tsx` — RSC, products SELECT + 필터 적용

**Acceptance**: 4 카드 정상 표시, 필터 URL 변경 + 결과 즉시 반영.

### Stage 6 — `/shop/[edition]` PDP (8~10h, 12~14K 토큰)

**TODO**
- [ ] `components/pdp/Gallery.tsx` — 메인 이미지 + 썸네일 (PDP는 영상 X, 이미지만)
- [ ] `components/pdp/OptionPicker.tsx` — 사이즈 라디오 (M/L 호환 시) + 수량
- [ ] `components/pdp/SpecTable.tsx` — 자재·치수·구성품
- [ ] `components/pdp/Layer4Section.tsx` — 홈에서 컴포넌트 재사용
- [ ] `components/pdp/ReviewsSection.tsx` — 해당 product reviews + 더보기 → `/reviews`
- [ ] `components/pdp/FaqSection.tsx` — Supabase faqs 카테고리 '제품' 필터
- [ ] `components/pdp/AddToCartButton.tsx` — Zustand store 호출 + 드로어 open
- [ ] `app/shop/[edition]/page.tsx` — RSC + Client 옵션 컴포넌트 혼합, JSON-LD Product + Offer (캠페인 폴더 참조)

**Acceptance**: 4 에디션 페이지 정상 렌더, 장바구니 추가 시 드로어 자동 open, 옵션·수량 상태 정확.

### Stage 7 — `/cart` (2~3h, 3~4K 토큰)

**TODO**
- [ ] `components/cart/CartLine.tsx`
- [ ] `components/cart/CartSummary.tsx` — 합계 + 무료배송 표시
- [ ] `app/cart/page.tsx` — Client, Zustand 구독

**Acceptance**: 드로어와 동일 데이터 동기화, 수량 변경·삭제 즉시 반영.

### Stage 8 — `/checkout` + Toss 위젯 (6~8h, 10~12K 토큰)

**TODO**
- [ ] Daum 우편번호 API 통합 (`@actbase/react-daum-postcode` 또는 script tag)
- [ ] `components/checkout/AddressForm.tsx` — 이름/전화/이메일/주소/요청사항
- [ ] `components/checkout/TossWidget.tsx` — `@tosspayments/tosspayments-sdk` v2 통합
- [ ] `lib/orderNo.ts` — `PP-YYYY-NNNNNN` 생성 (DB sequence 또는 timestamp 기반)
- [ ] `app/checkout/page.tsx` — 카트 → 폼 → 위젯 mount → 결제하기 클릭 시 orders INSERT (pending) + 토스 결제창
- [ ] 다크패턴 5유형 회피 (옵션 사전선택 X, 가격 1회 표시, 취소 명확)

**Acceptance**: Daum 주소 검색 정상, 토스 결제창 호출 (TEST 키), pending order 생성 확인.

### Stage 9 — 결제 API + 알림톡 (6~8h, 10~12K 토큰)

**TODO**
- [ ] `lib/toss.ts` — `confirmPayment(paymentKey, orderId, amount)` + amount 검증 + 멱등성
- [ ] `lib/solapi.ts` — `sendAlimtalk(template, to, vars)` + 솔라피 v4 API
- [ ] `app/api/payments/confirm/route.ts` — POST 핸들러, orders lookup → amount 검증 → 토스 confirm → status='paid' update → 알림톡 → response
- [ ] Slack/Discord webhook (관리자 알림 — amount 불일치 시)
- [ ] Vitest unit test 4종 (성공/금액불일치/멱등성/토스실패)

**Acceptance**: 토스 TEST 모드 결제 → success 페이지 → DB orders.status='paid' → 알림톡 발송 (테스트 번호).

### Stage 10 — `/checkout/success`, `/checkout/fail` (2~3h, 3~4K 토큰)

**TODO**
- [ ] `app/checkout/success/page.tsx` — server action으로 confirm POST, 주문번호 표시, GA4 purchase event, Meta Pixel Purchase event
- [ ] `app/checkout/fail/page.tsx` — 에러 메시지 + 재시도 CTA
- [ ] 카트 clear (success 시)

**Acceptance**: 결제 → success 페이지 → 주문번호 + GA/Pixel 이벤트 발사 확인.

### Stage 11 — 정적 페이지 6개 (4~6h, 6~8K 토큰)

**TODO**
- [ ] `app/reviews/page.tsx` — 전체 리뷰 갤러리 + 사진 필터
- [ ] `app/faq/page.tsx` — FaqAccordion + 카테고리 nav
- [ ] `app/about/page.tsx` — 브랜드 스토리 (카피 마케팅-agent 자산)
- [ ] `app/care-guide/page.tsx` — 길냥이 돌봄 가이드 (SEO 콘텐츠, 5~7 섹션)
- [ ] `app/give-back/page.tsx` — 길냥이 보호 메시지
- [ ] `app/orders/lookup/page.tsx` — 이메일 + 주문번호 + 휴대폰 끝4자리 → server action 검증 → 결과 표시
- [ ] `app/(legal)/privacy/page.tsx` `terms/page.tsx` `business-info/page.tsx`

**Acceptance**: 모든 페이지 정상 렌더, /orders/lookup에서 비회원 주문 검증 정상.

### Stage 12 — 뉴스레터 API + Cookie (2~3h, 3~4K 토큰)

**TODO**
- [ ] `app/api/newsletter/subscribe/route.ts` — 이메일 검증 + DB INSERT (consent_at, source='footer')
- [ ] 푸터 Footer.tsx 뉴스레터 폼 연결 (Server Action)
- [ ] CookieBanner.tsx — accept 시 localStorage 저장 + GA/Pixel script 동적 로드, decline 시 미로드
- [ ] `lib/analytics.ts` — consent 체크 후 이벤트 전송

**Acceptance**: 뉴스레터 가입 → DB 행 추가 + 중복 unique 차단. Cookie accept 후만 GA/Pixel 로드.

### Stage 13 — Cron 라우트 (3~4h, 4~5K 토큰)

**TODO**
- [ ] `app/api/alimtalk/retry/route.ts` — 미발송 paid orders → 솔라피 재호출 → retry_count++ (최대 3)
- [ ] `app/api/orders/cleanup/route.ts` — 24h 경과 pending → delete (or status='cancelled')
- [ ] `app/api/instagram/sync/route.ts` — 빈 구현 (현 MVP는 수기 캐시) + 추후 IG API 연동 자리
- [ ] `vercel.json` 등록 (`crons`)
- [ ] Vercel Cron secret 검증 (`CRON_SECRET` env)

**Acceptance**: `vercel dev` 또는 수동 호출로 정상 동작, 인증 secret 검증.

### Stage 14 — Analytics + Monitoring (2~3h, 3K 토큰)

**TODO**
- [ ] `lib/analytics.ts` — GA4 + Meta Pixel helper (consent gated)
- [ ] 이벤트: page_view, view_item, add_to_cart, begin_checkout, purchase
- [ ] Sentry 통합 (`@sentry/nextjs`)
- [ ] 환경변수 DSN

**Acceptance**: dev에서 이벤트 콘솔 확인, Sentry 더미 에러 캡처.

### Stage 15 — 테스트 (6~8h, 8~10K 토큰)

**TODO**
- [ ] Playwright init (`bunx playwright install`)
- [ ] E2E 5 시나리오 (spec v2 sec 9):
  1. `/` → 메가메뉴 → PDP → 옵션 → 카트 → 결제 → success
  2. `/shop` 필터 → 카드 → PDP
  3. `/reviews` 사진 필터 → 카드
  4. `/orders/lookup` 입력 → 결과
  5. 푸터 뉴스레터 가입 → DB
- [ ] Vitest unit (`/api/payments/confirm` 4 케이스)
- [ ] Playwright visual regression (5 페이지 스크린샷)

**Acceptance**: 전체 통과, CI에서 실행 가능.

### Stage 16 — 배포 준비 (2~3h, 3~4K 토큰)

**TODO**
- [ ] `README.md` — 셋업 가이드 + 외부 작업 체크리스트
- [ ] `.env.example` 최종 확인
- [ ] `vercel.json` Cron + headers + redirects
- [ ] CSP 헤더 (`next.config.ts` 또는 `vercel.json`)
- [ ] sitemap.xml + robots.txt (next-sitemap)
- [ ] 도메인 연결 가이드 문서 (가비아 → Vercel DNS 레코드 설명)
- [ ] 토스 가맹 신청용 사이트 URL 정리 문서

**Acceptance**: Vercel preview 배포 성공, 도메인 연결 가이드 사용자 검토.

---

## 5. 토큰·시간 추정 (총합)

| Stage | 토큰 | 시간 |
|---|---|---|
| 0 셋업 | 2K | 2h |
| 1 디자인 시스템 | 4K | 3h |
| 2 DB | 6K | 4h |
| 3 Layout | 8K | 6h |
| 4 홈 | 10K | 8h |
| 5 /shop | 5K | 4h |
| 6 PDP | 14K | 10h |
| 7 /cart | 4K | 3h |
| 8 /checkout | 12K | 8h |
| 9 결제 API | 12K | 8h |
| 10 결과 | 4K | 3h |
| 11 정적 6 | 8K | 6h |
| 12 뉴스레터+쿠키 | 4K | 3h |
| 13 Cron | 5K | 4h |
| 14 Analytics | 3K | 3h |
| 15 테스트 | 10K | 8h |
| 16 배포 준비 | 4K | 3h |
| **합계** | **~115K** | **~86h** (≈ 4주 풀타임 솔로 / 1~2주 subagent 병렬) |

---

## 6. 테스트 전략

### E2E (Playwright) — 5 시나리오 (Stage 15)

### Unit (Vitest)
- `/api/payments/confirm` 4 케이스 (성공·금액불일치·멱등성·토스실패)
- `lib/orderNo.ts` (생성 유니크성)
- `lib/cart/store.ts` (add/remove/update/persist)

### 시각 회귀 (Playwright screenshot diff)
- 홈, /shop, PDP 1개, /cart, /checkout 5개 페이지
- threshold 0.2

### 수동 QA 체크리스트
- 모바일 Safari/Chrome / 데스크탑 / 다크모드 / 한글 입력 / 카카오페이/네이버페이 결제 / 다크패턴 5유형 자체 점검

---

## 7. 위험 요소 + 대응

| 위험 | 확률 | 영향 | 대응 |
|---|---|---|---|
| 영상 자료 늦게 도착 | 높음 | UX 매력 ↓ | placeholder + Ken Burns로 출시. 영상 도착 즉시 `/public/videos/hero.mp4` 추가 + `<source>` 1줄. |
| 토스 가맹 심사 지연 | 중간 | 결제 불가, 출시 지연 | 가맹 신청 사이트 배포 후 즉시. 심사 동안 LP만 임시 (CTA → 스마트스토어). |
| 카카오 알림톡 템플릿 심사 반려 | 중간 | 알림톡 미발송 | 솔라피 일반 SMS fallback (`lib/solapi.ts`에 옵션). |
| Daum 우편번호 API 변경 | 낮음 | 주소 입력 불가 | `@actbase/react-daum-postcode` 안정 버전 핀, 폴백 입력 폼. |
| Supabase free tier 한도 초과 (트래픽↑) | 낮음 | DB 다운 | Vercel Analytics 모니터링, 임계치 시 pro 업그레이드. |
| Vercel free tier 한도 (Image Optimization 1000/mo) | 낮음 | 이미지 깨짐 | `next.config.ts` 이미지 unoptimized 옵션 또는 Cloudinary 전환. |
| 다크패턴 5유형 위반 (전자상거래법) | 낮음 | 과징금 | 자체 점검 체크리스트 (체크아웃 옵션 사전선택 X, 가격 1회 표시, 취소 명확). |
| 개인정보보호법 (Cookie 미동의) | 중간 | 과징금 | CookieBanner 출시 시 활성, accept 후만 GA/Pixel 로드. |

---

## 8. Subagent-Driven-Development 분배

병렬 가능 단계 → 서브에이전트 분배 (의존성 충돌 없는 그룹화):

| Subagent | Stage | 의존 |
|---|---|---|
| **A. 인프라** | 0, 1, 2 | — |
| **B. Layout** | 3 | A |
| **C. 홈** | 4 | B |
| **D. Shop** | 5 | B |
| **E. PDP** | 6 | D |
| **F. Cart+Checkout** | 7, 8 | E |
| **G. Payment** | 9, 10 | F |
| **H. 정적** | 11 | B |
| **I. Newsletter+Cookie** | 12 | B |
| **J. Cron** | 13 | G |
| **K. Analytics+Sentry** | 14 | C, G |
| **L. Tests** | 15 | 전체 |
| **M. 배포 준비** | 16 | L |

병렬 가능: A → B → (C·D·H·I 동시) → E → F → G → J → K → L → M
→ 솔로 86h을 ~30~40h으로 단축 가능 (subagent 4~5개 동시).

---

## 9. Next Steps

1. 이 plan 사용자 컨펌 (또는 명시 진행 신호 — 사용자는 이미 "개발 완료시켜놔" 명시)
2. `/subagent-driven-development` 호출
3. Subagent A부터 순차 + 가능한 단계 병렬 실행
4. 각 Stage 완료 시 git commit + 다음 Subagent 인계
5. Stage 15 통과 후 Stage 16 배포 준비
6. 사용자 외부 작업 (Supabase·Vercel·토스·솔라피·카카오·GA·Pixel·DNS) 가이드 제공
7. 영상 자료 수령 시 1줄 교체

---

## 10. 변경 이력

- **2026-05-21**: 초안 작성 — spec v2 기반 Stage 0~16 분할, subagent 분배, 토큰 추정.
