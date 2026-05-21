# 도메인 연결 가이드 (가비아 → Vercel)

## 1. Vercel 도메인 추가

1. Vercel 프로젝트 → Settings → Domains
2. `purrpik.co.kr` 입력 → Add
3. Vercel이 요구하는 DNS 레코드 확인 (A, CNAME)

## 2. 가비아 DNS 설정

1. 가비아 로그인 → 도메인 통합관리툴
2. `purrpik.co.kr` 선택 → DNS 정보 → DNS 관리
3. 레코드 추가:
   - 타입 A, 호스트 `@`, 값 `76.76.21.21`, TTL 600
   - 타입 CNAME, 호스트 `www`, 값 `cname.vercel-dns.com`, TTL 600
4. 적용 → 5분~24h 전파 대기

## 3. Vercel SSL 자동 발급

DNS 전파 완료 시 Vercel이 Let's Encrypt SSL 자동 발급. 약 1~10분.

## 4. 검증

- `dig purrpik.co.kr` → `76.76.21.21`
- `curl -I https://purrpik.co.kr` → `HTTP/2 200` + SSL valid
- 브라우저로 `https://purrpik.co.kr` 접속 → 푸르픽 자사몰 표시

## 5. 토스 가맹 신청

사이트 라이브 후:

1. https://toss-payments.com → 가맹 신청
2. 사이트 URL: `https://purrpik.co.kr`
3. 사업자등록증 + 통신판매업신고증 업로드
4. 심사 3~7영업일
5. 승인 후 LIVE 키 발급 → Vercel env 갱신 → 재배포

## 6. 알림톡 채널 / 템플릿 발급

1. https://coolsms.io 가입 → API Key + Secret 발급
2. 카카오 비즈채널 등록 (`@purrpik`) → PFID 발급
3. 알림톡 템플릿 등록 (주문완료) → 카카오 심사 1~2일
   - 변수: `{#{주문번호}}`, `{#{상품명}}`, `{#{결제금액}}`
4. Vercel env에 `SOLAPI_API_KEY` / `SOLAPI_API_SECRET` / `SOLAPI_KAKAO_PFID` / `SOLAPI_KAKAO_TEMPLATE_ORDER` / `SOLAPI_SENDER_PHONE` 등록 → 재배포

## 7. Cron 활성화

- `vercel.json`에 정의된 cron 4개 (재고/리뷰/인스타/뉴스레터)
- `CRON_SECRET` env 등록 시 자동 활성화
- Vercel 대시보드 → Cron Jobs 탭에서 실행 이력 확인
