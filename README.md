# 푸르픽 자사몰 (purrpik-store)

푸르픽 길고양이 보호 셸터 D2C 자사몰. Next.js 16 + Supabase + TossPayments + 솔라피 알림톡.

## 빠른 시작 (로컬 개발)

```bash
bun install
cp .env.example .env.local  # 환경변수 입력
bun dev
```

http://localhost:3000

## 사용자 직접 외부 작업 체크리스트

배포·실서비스 운영 전 사용자가 직접 수행해야 할 외부 작업입니다.

### 인프라

- [x] 가비아 도메인 `purrpik.co.kr` 구매 (2026-05-20 완료)
- [ ] Supabase 프로젝트 생성 (한국 리전, free tier) → URL / anon / service_role 키 발급
- [ ] Vercel 프로젝트 생성 + GitHub 레포 연결
- [ ] Vercel 환경변수 등록 (아래 `.env.example` 참조)
- [ ] 가비아 DNS → Vercel
  - A 레코드: `@` → `76.76.21.21`
  - CNAME: `www` → `cname.vercel-dns.com`
  - 전파 5분~24시간

### 결제

- [ ] 토스페이먼츠 가맹 신청 (사이트 임시 배포 후, 사업자등록증 + 통신판매업신고증 + 도메인 필요, 심사 3~7영업일)
- [ ] 토스 가맹 완료 후 LIVE 키 발급 → `NEXT_PUBLIC_TOSS_CLIENT_KEY` / `TOSS_SECRET_KEY` Vercel env 등록

### 알림톡

- [ ] 솔라피 가입 (https://coolsms.io) → API Key + Secret 발급
- [ ] 카카오 비즈채널 등록 (`@purrpik` 또는 별도 채널) → PFID 발급
- [ ] 알림톡 템플릿 등록 (주문완료 — 카카오 심사 1~2일)
  - 템플릿 변수: `{#{주문번호}}`, `{#{상품명}}`, `{#{결제금액}}`
- [ ] env에 `SOLAPI_*` + `SOLAPI_KAKAO_PFID` + `SOLAPI_KAKAO_TEMPLATE_ORDER` 등록

### 분석·모니터링

- [ ] GA4 속성 생성 → 측정 ID (`G-XXXXXXXXXX`) → `NEXT_PUBLIC_GA4_ID`
- [ ] Meta 비즈니스 계정 + Pixel 생성 → `NEXT_PUBLIC_META_PIXEL_ID`
- [ ] Sentry 프로젝트 생성 → DSN → `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Vercel Cron secret 생성 (random 32자 이상) → `CRON_SECRET` (Vercel env)

### 컨텐츠

- [ ] 영상 자료 (히어로용): 가로 16:9 + 세로 9:16, 30초 이하, 720/1080p — 도착 시 `public/videos/hero.mp4` 추가 + `components/home/VideoHero.tsx`의 `<source>` 1줄 활성화
- [ ] 제품 이미지 (4 에디션 × 3컷) — `public/images/products/[id]-hero.jpg` 등
- [ ] 인스타그램 `@purrpik` 운영 + 최신 게시물 12개 → `instagram_posts` 시드 데이터 업데이트 (또는 `active=true` 토글)
- [ ] 법적 페이지 보완: `/business-info` `/privacy` `/terms` 실제 사업자정보·약관 본문 입력

## 환경변수

`.env.example` 참조. 모두 필수는 아니며 미설정 시 graceful degrade (해당 기능 비활성).

## 사용 가능한 명령

| 명령 | 설명 |
|---|---|
| `bun dev` | 로컬 dev 서버 (http://localhost:3000) |
| `bun run build` | 프로덕션 빌드 |
| `bun start` | 프로덕션 서버 |
| `bun run lint` | ESLint |
| `bun run test` | Vitest unit (26 tests) |
| `bun run test:e2e` | Playwright E2E (10 tests + 시각 회귀 5) |
| `bun run test:e2e:update` | 시각 회귀 baseline 업데이트 |

## 배포 (Vercel)

1. GitHub repo 푸시
2. Vercel에서 import
3. 환경변수 등록 (모든 키)
4. Deploy → preview URL 확인
5. 도메인 연결 (`purrpik.co.kr`) — `docs/deployment/domain-setup.md` 참조
6. Cron 자동 활성화 (`vercel.json` 참조)

## 아키텍처

- **Framework**: Next.js 16 (App Router, RSC + Server Actions)
- **DB**: Supabase (Postgres + RLS, 한국 리전)
- **결제**: TossPayments (위젯 v2)
- **알림톡**: 솔라피 카카오 비즈메시지
- **이미지**: next/image + Supabase Storage
- **분석**: GA4 + Meta Pixel
- **에러**: Sentry
- **호스팅**: Vercel (Edge + Cron)

```
Browser → Next.js (RSC) → Supabase (RLS) → TossPayments / 솔라피
                       ↓
                  GA4 / Meta Pixel / Sentry
```

## 컴플라이언스

- 전자상거래법 다크패턴 5유형 회피
- 개인정보보호법 (2026-09-11 시행): Cookie 동의 배너 + 행태정보 사전 동의
- 정보통신망법: 뉴스레터 마케팅 수신 동의 필수
- 카카오 알림톡: 템플릿 사전 심사

## 다음 단계 (백로그)

- **P2**: 회원가입·로그인 / 적립금 / 쿠폰 / 자동 리뷰 임포트 / Instagram API 정식 통합
- **P3**: 정기배송 / 굿즈 / 기부 실제 캠페인 / Mux 비디오 호스팅

## 문서

- spec v2: `docs/superpowers/specs/2026-05-21-purrpik-store-design-v2.md`
- plan v1: `docs/01-plan/features/purrpik-store-v1.plan.md`
- 배포 가이드: `docs/deployment/domain-setup.md`
- 라이선스: Proprietary (사용자 자체 자산)
