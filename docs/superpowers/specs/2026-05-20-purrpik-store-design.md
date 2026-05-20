# Purrpik Store — 자사몰 설계 스펙

- **날짜**: 2026-05-20
- **상태**: 사용자 리뷰 대기 → writing-plans 이행
- **출처**: brainstorming 세션 (Visual Companion 사용, 6단계 결정 트리)

---

## 0. 컨텍스트

- **제품**: 푸르픽 길고양이집 4-tier (BASIC M/L 29,900~34,900원, ALL-IN-ONE M/L 39,900~44,900원)
- **기존 채널**: 스마트스토어 + 쿠팡 운영 중 (제품·카피·이미지 자산 풍부, `/Users/ljh/Documents/marketing-agent/workspace/campaigns/2026-04-20_길고양이집/`)
- **자사몰 목적**: 광고 깔때기 LP + 결제 + 브랜드 신뢰 (스마트스토어와 톤 분리)
- **도메인**: `purrpik.co.kr` (가비아 구매 완료, 2026-05-20)
- **출시 절차**: 최소 MVP 우선 (3~5일), 풀세트는 백로그
- **제약**: 사업자등록증·통신판매업신고증 보유. 토스페이먼츠 가맹은 미신청 (사이트 임시 배포 후 신청)

---

## 1. 기술 스택

| 영역 | 선택 | 근거 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router, RSC) | PhotoPal Korea와 동일 패턴 |
| DB / Auth | Supabase Postgres + RLS | free tier, 한국 리전 |
| 배포 | Vercel | Edge + Cron + 환경변수 관리 |
| 스타일 | Tailwind v4 + shadcn/ui | 컴포넌트 표준 |
| 결제 | TossPayments 결제위젯 v2 | 토스 한국 PG 1순위 |
| 알림톡 | 솔라피 (CoolSMS) | 카카오 알림톡 API 가장 흔함 |
| 폰트 | Pretendard Variable (CDN) | 한국어 본문·헤드 단일 |

---

## 2. 비주얼 톤

- **방향**: 모던 미니멀 (마켓컬리 / 29CM 톤)
- **베이스**: 화이트 (`#ffffff`) · 텍스트 블랙 (`#0a0a0a`) · 보조 그레이 (`#525252`, `#737373`, `#e5e5e5`)
- **액센트**: 머스터드 (`#c17a1f`) — CTA·강조·배지에만
- **폰트**: Pretendard만 (Light 300 / Regular 400 / Bold 700)
- **자산 재사용**: 카피·이미지·구조화 데이터는 기존 캠페인 폴더에서 가져옴
- **스마트스토어 톤(크래프트 매거진)과는 분리** — 자사몰 = 프리미엄 D2C 인상

---

## 3. 페이지 구조 (라우트)

| 경로 | 역할 | 렌더링 |
|---|---|---|
| `/` | LP — 히어로 · USP · 4중구조 · 테스트 수치 · 에디션 비교 · 리뷰(P2) · FAQ · 푸터 CTA | RSC (정적, ISR 24h) |
| `/checkout` | 에디션 선택 + 배송지 폼 + 토스 위젯 마운트 | Client |
| `/checkout/success` | 결제 승인 트리거 + 주문번호 표시 + 알림톡 발송 확인 | RSC + Server Action |
| `/checkout/fail` | 결제 실패 안내 + 재시도 CTA | RSC |
| `/orders/lookup` | 비회원 주문조회 (이메일 + 주문번호 + 휴대폰 4자리) | Client + Server Action |
| `/privacy` · `/terms` · `/business-info` | 약관 · 사업자정보 (전자상거래법 의무) | RSC |
| `/api/payments/confirm` | 토스 결제승인 + DB 저장 + 알림톡 트리거 | Route Handler |
| `/api/alimtalk/retry` | 미발송 알림톡 재시도 (Vercel Cron `*/5 * * * *`, `vercel.json`에 등록) | Route Handler |
| `/api/orders/cleanup` | 24h 경과 `pending` 주문 정리 (Vercel Cron `0 3 * * *`, 새벽 3시 1회) | Route Handler |

---

## 4. 데이터 모델 (Supabase)

### 4.1 스키마

```sql
-- products: 시드 4건
create table products (
  id text primary key,            -- 'basic-m' | 'basic-l' | 'allinone-m' | 'allinone-l'
  name text not null,
  price int not null,             -- 원 단위 정수
  size_outer text,                -- '40×28×28cm'
  size_entry text,                -- '14×18cm'
  includes jsonb not null,        -- ["본체", "극세사 담요", ...]
  edition text not null,          -- 'BASIC' | 'ALL_IN_ONE'
  size_class text not null,       -- 'M' | 'L'
  active boolean default true,
  created_at timestamptz default now()
);

-- orders: 비회원 기준 (회원은 P2에서 user_id 컬럼 추가)
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique not null,         -- 'PP-2026-000123' (사람용)
  product_id text references products(id),
  amount int not null,                   -- 결제 금액 (원)
  status text not null default 'pending',
  -- 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  toss_payment_key text,
  toss_order_id text unique,             -- 멱등성 보장
  buyer_name text not null,
  buyer_phone text not null,
  buyer_email text not null,
  ship_zipcode text not null,
  ship_addr1 text not null,
  ship_addr2 text,
  ship_memo text,
  alimtalk_sent_at timestamptz,
  alimtalk_retry_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_orders_status on orders(status);
create index idx_orders_alimtalk on orders(alimtalk_sent_at, status) where status = 'paid' and alimtalk_sent_at is null;
```

### 4.2 RLS

```sql
alter table products enable row level security;
create policy "anon can read active products" on products
  for select using (active = true);

alter table orders enable row level security;
-- anon은 읽기/쓰기 불가. service role만 접근. lookup은 server action에서 검증 후 반환.
```

---

## 5. 결제 흐름 (TossPayments 결제위젯 v2)

### 5.1 시퀀스

1. 사용자가 `/checkout` 접근 → 에디션 라디오 + 배송지 폼 입력
2. "결제하기" 클릭 → 클라이언트가 `orderNo` 생성 (`PP-YYYY-NNNNNN`) + Supabase에 `orders` row INSERT (`status='pending'`)
3. TossPayments 위젯 mount → 결제수단 선택 (카드 · 계좌이체 · 카카오페이 · 네이버페이)
4. 결제 진행 → 토스 서버가 `/checkout/success?paymentKey=...&orderId=...&amount=...`로 redirect
5. success 페이지가 mount 시 `POST /api/payments/confirm { paymentKey, orderId, amount }` 호출
6. 서버:
   - `orders` 테이블에서 `orderId` lookup → `amount` 일치 검증 (불일치 시 401 + 관리자 알림)
   - 토스 confirm API 호출 (`Authorization: Basic base64(secretKey:)`)
   - 200 응답 시 `orders.status='paid'`, `toss_payment_key` 저장 (트랜잭션)
   - 솔라피 알림톡 발송 (템플릿: 주문완료)
   - `alimtalk_sent_at` 업데이트
7. 성공 응답 → success 페이지에 주문번호 + 알림톡 발송 안내

### 5.2 멱등성

- `orders.toss_order_id UNIQUE` 제약
- confirm 재호출 시 `status='paid'` 확인 후 토스 호출 스킵 (중복 결제 차단)

---

## 6. 에러 처리

| 단계 | 실패 케이스 | 처리 |
|---|---|---|
| 토스 결제창 | 사용자 취소 · 카드 오류 | `/checkout/fail` 리다이렉트, `orders.status='pending'` 유지 (TTL 24h cleanup cron) |
| confirm amount 불일치 | 위변조 시도 | 401 + 관리자 알림 (Slack/Discord webhook) + DB 기록 |
| 토스 confirm 실패 (네트워크 · 타임아웃) | API 다운 | exponential backoff 1회 재시도. 실패 시 "결제 확인 중" 안내 + Vercel Cron 백그라운드 재확인 |
| 알림톡 발송 실패 | 솔라피 API 다운 | `alimtalk_sent_at` NULL 유지, `/api/alimtalk/retry` Cron 5분마다 미발송 건 재시도 (최대 3회, `alimtalk_retry_count` 컬럼) |
| DB 쓰기 실패 | Supabase 다운 | Sentry 캡처 + 사용자엔 generic 에러. 결제는 이미 토스 승인됐으니 수동 복구 (관리자 알림 즉시) |

**전자상거래법 다크패턴 5유형 회피** (2026-02-14 시행):
- 사전선택 옵션 없음 (4종 라디오 디폴트 unchecked)
- 가격 1회 표시 (배송비 포함 총액 단일)
- 취소 버튼 명확 (`/checkout/fail` 단순 경로)
- 숨은 갱신 X (정기배송 P3, 도입 시 명시적 동의 UI)

---

## 7. 테스팅

- **토스 테스트 모드**: TEST 키로 카드결제 시뮬레이션 (토스 제공 테스트 카드번호)
- **E2E**: Playwright — `/` → CTA 클릭 → `/checkout` → 옵션 선택 → 폼 입력 → 결제 mock → success 렌더 확인
- **Unit**: `/api/payments/confirm` (성공 · 금액 불일치 · 멱등성 · 토스 실패 케이스 4종)
- **로컬 dev**: Supabase CLI (`supabase start`) + `vercel dev`
- **알림톡 테스트**: 사용자 본인 번호로 발송. 템플릿 사전 등록 + 카카오 심사 필요
- **수동 QA 체크리스트**: 모바일 Safari/Chrome · 데스크탑 · 다크모드 · 한글 입력 · 카카오페이/네이버페이 결제

---

## 8. MVP scope (P1 — 출시 3~5일)

- [ ] LP `/` — 모던 미니멀 톤, 카피·이미지는 기존 캠페인 자산 활용
- [ ] `/checkout` — 게스트 결제 + 토스 위젯
- [ ] `/api/payments/confirm` — 결제 검증 + DB 기록
- [ ] 솔라피 알림톡 — 주문완료 템플릿 1종
- [ ] FAQ 섹션 — LP 내 7문항 (기존 캠페인 자산 활용)
- [ ] 법적 페이지 `/privacy`, `/terms`, `/business-info`
- [ ] 비회원 주문조회 `/orders/lookup`
- [ ] GA4 + Meta Pixel — 광고 트래킹용
- [ ] Sentry — 에러 모니터링

---

## 9. 백로그 (풀세트 P2/P3 — MVP 출시 후)

| 우선순위 | 기능 | 의존성 |
|---|---|---|
| P2-1 | Supabase Auth 회원가입 · 로그인 (이메일 + 카카오 OAuth) | 사용자 데이터 누적 |
| P2-2 | 적립금 시스템 (`points` 테이블 + 적립 · 사용 트랜잭션 로그) | 회원가입 선행 |
| P2-3 | 리뷰 (`reviews` + 관리자 수기 등록 admin 페이지) | 첫 주문 발송 |
| P2-4 | 쿠폰 · 프로모코드 (`coupons` + 결제 시 할인 적용) | — |
| P3-1 | 인스타 피드 임베드 (Instagram Basic Display API or 캡션 수기) | @purrpik 운영 |
| P3-2 | 정기배송 (계절 부속 — 여름 쿨매트 → 겨울 단열패드) | 신규 부속 상품 등록 |
| P3-3 | 굿즈 · 추가 상품 (스크래쳐, 사료볼) | 단일제품 한계 인지 |

---

## 10. 폴더 구조

```
purrpik-store/
├─ app/
│  ├─ layout.tsx              # 루트 (Pretendard, metadata, GA, Sentry init)
│  ├─ page.tsx                # LP (RSC)
│  ├─ checkout/
│  │  ├─ page.tsx             # Client (옵션선택 + 폼 + 토스위젯)
│  │  ├─ success/page.tsx     # RSC + confirm 트리거
│  │  └─ fail/page.tsx
│  ├─ orders/lookup/page.tsx
│  ├─ (legal)/
│  │  ├─ privacy/page.tsx
│  │  ├─ terms/page.tsx
│  │  └─ business-info/page.tsx
│  └─ api/
│     ├─ payments/confirm/route.ts
│     ├─ alimtalk/retry/route.ts    # Vercel Cron */5 * * * *
│     └─ orders/cleanup/route.ts    # Vercel Cron 0 3 * * *
├─ components/
│  ├─ landing/                # Hero, USP, Layer4, Test, Editions, Reviews(P2), FAQ
│  ├─ checkout/               # EditionPicker, AddressForm, TossWidget
│  └─ ui/                     # shadcn/ui generated
├─ lib/
│  ├─ supabase/server.ts      # createServerClient
│  ├─ supabase/client.ts
│  ├─ toss.ts                 # confirm helper + amount 검증
│  ├─ solapi.ts               # 알림톡 helper
│  └─ orderNo.ts              # PP-YYYY-NNNNNN 생성
├─ supabase/
│  ├─ migrations/0001_init.sql   # products + orders + RLS
│  └─ seed.sql                   # products 4건
├─ public/
│  └─ images/                 # 기존 캠페인 폴더에서 복사
├─ docs/
│  └─ superpowers/specs/
├─ vercel.json                # Cron 등록
├─ next.config.ts
├─ tailwind.config.ts
├─ tsconfig.json
├─ package.json
├─ .env.example
└─ README.md
```

---

## 11. 환경 변수 (`.env.example`)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# TossPayments
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=

# 솔라피 (카카오 알림톡)
SOLAPI_API_KEY=
SOLAPI_API_SECRET=
SOLAPI_KAKAO_PFID=                 # 카카오 비즈채널 PFID
SOLAPI_KAKAO_TEMPLATE_ORDER=       # 알림톡 템플릿 ID (주문완료)
SOLAPI_SENDER_PHONE=               # 발신 번호 (사전 등록)

# 트래킹
NEXT_PUBLIC_GA4_ID=
NEXT_PUBLIC_META_PIXEL_ID=

# 운영
ADMIN_WEBHOOK_URL=                 # Slack/Discord 관리자 알림
SENTRY_DSN=
```

---

## 12. 보안

- **RLS**: products는 anon SELECT 가능 (active=true만), orders는 server-only
- **TossPayments amount 위변조 검증**: confirm 시 DB amount와 토스 amount 일치 확인
- **Secret keys**: Vercel env (`NEXT_PUBLIC_` 접두사 없는 것은 서버 전용)
- **HTTPS only**: Vercel 자동
- **Rate limit**: `/api/payments/confirm` IP당 분당 10회 (Upstash Redis 옵션, MVP는 미적용)
- **CSP 헤더**: TossPayments + Supabase + GA4 + Meta 도메인만 허용

---

## 13. 컴플라이언스 (한국 시장 2026)

| 법규 | 적용 |
|---|---|
| 전자상거래법 다크패턴 5유형 금지 (2026-02-14 시행) | 다크패턴 회피 — 6. 에러 처리 참조 |
| 개인정보보호법 개정 (시행 2026-09-11) | 행태정보 수집 시 명시 (GA · Meta Pixel 동의 배너 P2) |
| 표시광고법 시행령 개정 (2026) | 과장 광고 회피, 자체 시험 수치 명시 |
| 공정위 추천보증 심사지침 | 광고 임을 표시 (인스타 임베드 도입 시 첫 부분 표시) |
| 카카오 알림톡 정책 | 템플릿 사전 등록 + 카카오 심사 1~2일 |

---

## 14. 출시 체크리스트

### 사용자 직접 작업
- [x] 가비아 도메인 `purrpik.co.kr` 구매 (2026-05-20 완료)
- [ ] Supabase 프로젝트 생성 (한국 리전, free tier)
- [ ] Vercel 프로젝트 연결 + 환경변수 등록
- [ ] DNS: 가비아 → Vercel (A `76.76.21.21` + CNAME `cname.vercel-dns.com`)
- [ ] 토스페이먼츠 가맹 신청 (사이트 임시 배포 후, 3~7영업일)
- [ ] 솔라피 가입 + API Key 발급
- [ ] 카카오 비즈채널 등록 + 알림톡 템플릿 등록 (심사 1~2일)
- [ ] GA4 + Meta Pixel 발급

### 구현 작업 (writing-plans에서 상세화)
- [ ] Next.js 16 scaffold
- [ ] Supabase 마이그레이션 + 시드
- [ ] LP 섹션 컴포넌트 + 카피·이미지 포팅
- [ ] `/checkout` + 토스 위젯
- [ ] `/api/payments/confirm`
- [ ] 솔라피 알림톡 helper
- [ ] 법적 페이지
- [ ] `/orders/lookup`
- [ ] 토스 테스트 모드 결제 검증
- [ ] 알림톡 발송 테스트
- [ ] Vercel 배포 + 도메인 연결

---

## 15. 변경 이력

- 2026-05-20: 초안 작성, brainstorming 세션 결과 (페이지 구조 B / 풀세트→최소MVP / 비주얼 B 모던미니멀 / 도메인 purrpik.co.kr / 스택 Next.js+Supabase+Vercel+Toss+솔라피)
