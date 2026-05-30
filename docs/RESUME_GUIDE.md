# 푸르픽 자사몰 — 작업 재개 가이드

> **마지막 업데이트**: 2026-05-30
> **재개 트리거**: "푸르픽 자사몰 작업 이어가자" 또는 이 파일 첨부

---

## 현재 상태 (2026-05-30)

### 완료
- [x] 도메인 `purrpik.co.kr` 가비아 구매 (2026-05-20)
- [x] Spec v3 (Wild One 벤치 + 멀티펫 게이트) 작성
- [x] Plan + 구현 17 commits (Stage 0~18)
- [x] Supabase 프로젝트 생성 + DB 마이그레이션 + 시드
- [x] GitHub repo `dlwjdghkszkf-png/purrpik-store` (main 9413eb4)
- [x] Vercel 프로젝트 + GitHub 연결 + env 입력
- [x] 라이브 사이트 `https://purrpik-store.vercel.app` 동작 (PDP 정상)
- [x] **DNS 가비아 → Vercel 연결 완료 (2026-05-29)**
  - A `@` → `216.198.79.1`
  - CNAME `www` → `ad7233d18b3ddcc3.vercel-dns-017.com.`
  - 3개 DNS (가비아 NS / Google 8.8.8.8 / Cloudflare 1.1.1.1) 모두 정상
- [x] 솔라피 가입 (잔액 300원 가입보너스, 발신번호 `010-2058-0176` 등록)
- [x] 카카오 비즈니스 채널 심사 통과
- [x] 알림톡 변수 `상품명` 슬러그 → 진짜 이름 fix (commit `9413eb4`)

### 진행 중 / SSL 자동 발급 대기
- [ ] Vercel SSL 자동 발급 (DNS 인식 후 5~30분, 완료 시 `https://purrpik.co.kr` 200)
- [ ] **솔라피 카카오 채널 연동** (지금 막힘 지점)

### 사용자 외부 작업 남은 항목
- [ ] 솔라피 카카오 채널 연동 → PFID 발급
- [ ] 솔라피 API Key 발급
- [ ] 솔라피 알림톡 템플릿 등록 + 심사 (1~2영업일)
- [ ] 토스페이먼츠 가맹 신청 (사이트 라이브 + 법적 본문 후)
- [ ] 카카오톡 floating URL (카카오 채널 URL → env)
- [ ] 영상 자료 (가로 16:9 + 세로 9:16, 30초 이하)
- [ ] 제품 이미지 (hero + gallery 3장)
- [ ] 인스타 게시물 12개 (수기 시드)
- [ ] 법적 페이지 본문 (privacy/terms/business-info)
- [ ] GA4 + Meta Pixel + Sentry 키 발급 + Vercel env 등록

---

## 즉시 다음 액션 (모바일에서 이어가기)

### Step A: SSL 발급 확인
```
브라우저: https://purrpik.co.kr
```
200 응답이면 SSL 완료. 404/SSL 에러면 5분 더 대기 후 재시도.

### Step B: 솔라피 카카오 채널 연동

#### B1. 카카오 채널 관리자 추가인증 ON (먼저)
1. https://center-pf.kakao.com → `@purrpik` 채널 진입
2. 우측 상단 **내 정보** 클릭
3. **관리자 추가인증 설정** → **ON** 토글 → 저장

**이거 안 하면 솔라피 연동 시도해도 카카오톡 인증 알림 안 옴.**

#### B2. 솔라피 카카오 채널 등록
1. https://console.solapi.com/kakao/channels
2. **+ 새 카카오 채널** 클릭
3. 검색용 ID `@purrpik` 입력
4. 카카오톡으로 인증번호 옴 → 입력
5. 완료 시 **PFID (`KA01PF...`) 발급** ← 메모

### Step C: 솔라피 알림톡 템플릿 등록

1. https://console.solapi.com/kakao/templates
2. **+ 새 템플릿** 클릭
3. 입력값:

**기본 정보**
- 템플릿명: `purrpik_payment_completed`
- 카테고리: 서비스이용 > 거래 > **결제완료**
- 메시지 유형: 기본형

**본문** (그대로 복사)
```
[푸르픽] 주문이 정상 결제되었습니다.

▶ 주문번호: #{주문번호}
▶ 상품: #{상품명}
▶ 결제금액: #{결제금액}

영업일 기준 1~3일 내 발송됩니다.
발송 시 운송장 번호를 별도로 안내드립니다.

문의: 카카오톡 채널 @purrpik
```

**변수**
- `#{주문번호}` 예시 `PP-20260530-A1B2C3`
- `#{상품명}` 예시 `푸르픽 길고양이집`
- `#{결제금액}` 예시 `39,900원`

**버튼**
- 웹링크 "주문 조회" → `https://purrpik.co.kr/orders/lookup`
- 웹링크 "고객센터" → `http://pf.kakao.com/_purrpik/chat`

4. **심사 신청** → 1~2영업일 대기
5. 통과 시 **템플릿 ID (`TT_...`) 발급** ← 메모

**금지 단어 (심사 탈락)**: 할인·이벤트·특가·%·혜택·쿠폰 → 본문에 0개 ✅

### Step D: 솔라피 API Key 발급

1. https://console.solapi.com/developers/api-keys
2. **+ 새 API Key**
3. 이름 `purrpik-store`, 권한 `messages:write`
4. **API Secret은 1회만 표시** — 메모장에 즉시 저장

### Step E: Vercel env 추가

https://vercel.com/dlwjdghkszkf-7914s-projects/purrpik-store/settings/environment-variables

```
SOLAPI_API_KEY=NCS...            ← Step D
SOLAPI_API_SECRET=...            ← Step D
SOLAPI_SENDER_PHONE=01020580176  ← 이미 솔라피 등록됨
SOLAPI_KAKAO_PFID=KA01PF...      ← Step B2
SOLAPI_KAKAO_TEMPLATE_ORDER=TT_... ← Step C 심사 통과 후
```

추가 후 Vercel 자동 재배포 → 알림톡 실제 발송 가능.

---

## 코드 상태

### Repo
- GitHub: `dlwjdghkszkf-png/purrpik-store`
- Branch: `main` (feat/v1-build → main 머지 완료)
- HEAD: `9413eb4 feat(alimtalk): use products.name instead of product_id slug in template variable`

### 알림톡 관련 코드
- `lib/solapi.ts` — HMAC-SHA256 wrapper
- `app/api/payments/confirm/route.ts:88` — orders+products 조인 select
- `app/api/payments/confirm/route.ts:198-202` — variables 매핑
- `app/api/alimtalk/retry/route.ts:44-58` — Cron 재시도 (orders+products 조인)
- `vercel.json` — Cron 스케줄 (alimtalk `0 9 * * *` 매일 9시)

### 테스트
- `tests/unit/payments-confirm.test.ts` — 6 PASS
- Mock `mockOrderRow.products = { name: "푸르픽 길고양이집" }` 포함

### Vercel env 이미 입력 완료 (작동 중)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://purrpik.co.kr` (SSL 발급 후 변경 권장)
- `TOSS_CLIENT_KEY` (테스트키 또는 실제 가맹 후)
- `TOSS_SECRET_KEY`
- `CRON_SECRET`

---

## 트러블슈팅

### SSL 안 잡힘
1. Vercel Domains > Refresh 클릭
2. `dig @8.8.8.8 purrpik.co.kr A +short` → `216.198.79.1` 응답 확인
3. 1시간 지나도 안 되면 Vercel support 문의

### 솔라피 카카오 인증번호 안 옴
- B1 (관리자 추가인증 ON) 안 됐을 가능성 99%
- 카카오 채널 관리자센터에서 ON 후 재시도

### 알림톡 심사 탈락
- 본문 광고성 단어 확인 (할인·이벤트·% 등)
- 버튼 URL 도메인이 비즈채널과 일치하는지 확인
- 변수 형식 `#{변수명}` 정확히

### Vercel 빌드 실패
- 환경변수 줄바꿈 포함 시 `cleanEnv` helper가 자동 trim
- `lib/supabase/server.ts:10`, `lib/supabase/client.ts:5` 참조

---

## 관련 문서

- Spec v3: `docs/superpowers/specs/2026-05-22-purrpik-store-design-v3-multipet.md`
- Plan: `docs/01-plan/features/purrpik-store-v1.plan.md`
- 캠페인 자산: `~/Documents/marketing-agent/workspace/campaigns/2026-04-20_길고양이집/`
- 메모리: `~/.claude/projects/-Users-ljh/memory/project_purrpik_store_state.md`
