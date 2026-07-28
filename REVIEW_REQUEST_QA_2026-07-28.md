# sol 리뷰 요청 — 자사몰 전체 QA (2026-07-28)

## 대상
- 레포: purrpik-store (Next.js 16 App Router + Supabase + Zustand cart)
- 라이브: https://www.purrpik.co.kr
- 목적: 전 페이지 동작 QA — "안 눌리는 버튼"과 "간헐적으로 /shop에 상품이 안 뜨는 현상" 근본 원인 색출

## 사용자 실관측 증상
1. **안 눌리는 버튼이 아직 있다** (구체 위치 미상 — 전수 점검 필요)
2. **/shop 진입 시 가끔 상품이 하나도 안 뜸** (재현 간헐적. 방금 curl 10연타는 전부 정상)

## 이미 고친 것 (재발견 불필요)
- 메가패널 클라이언트 네비 후 잔존 → 필터 토글 클릭 가로채던 버그 (MegaMenu.tsx, usePathname close)
- 죽은 검색 버튼 제거, title 이중 접미사, Sheet aria 경고
- 토스 키 미발급 상태 카드결제 탭 숨김 (checkout/page.tsx cardEnabled)

## 유력 용의자 (검증 요청)
1. **Supabase fetch 전부 silent-fail → 빈 배열/null 반환** 패턴:
   - `app/shop/page.tsx` fetchMasterProducts: error/throw 시 `[]` → "등록된 상품이 없습니다" 렌더. 재시도·에러UI·로깅(프론트) 없음
   - `app/shop/[id]/page.tsx` fetchMasterProduct: null → notFound() — 순단이면 멀쩡한 상품이 404
   - 같은 패턴이 reviews/faqs/기타 fetch에도 존재하는지 전수 확인
2. **cookies() 기반 createClient가 모든 페이지를 dynamic으로 만듦** — 상품 카탈로그처럼 정적이어도 되는 데이터가 매 요청 Supabase 왕복 = 순단 노출면 확대. anon 공개읽기 데이터는 cookieless client / unstable_cache / ISR로 분리 가능한지
3. **클라이언트 인터랙션 dead spot**: 전 페이지 button/link 중 핸들러 없거나 조건부로 죽는 것 (StickyBuyBar, MobileOptionSheet, OptionPicker, Gallery 썸네일, FAQ 아코디언, MiniCartDrawer 수량/삭제, AccountLink, PetTypeBadge, 홈 게이트 3버튼, CookieBanner, KakaoChannelButton, checkout 주소검색(Daum postcode?) 등)
4. hydration 실패로 인한 무반응 가능성 (zustand persist, mounted 게이트)

## 산출물 형식
`REVIEW_SOL_QA_2026-07-28.md`에:
- P0/P1/P2 분류, 파일:라인, 재현 조건, 수정 방향 (패치 코드 스니펫 환영)
- "안 눌리는 버튼" 후보 전수 목록 (컴포넌트별)
- /shop 간헐 빈화면의 근본 원인 판정 + 방어책 (재시도/캐시/에러UI 중 뭘 어디에)
