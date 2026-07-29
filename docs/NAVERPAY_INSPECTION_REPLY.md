# 네이버페이 검수 회신 (dl_techsupport@navercorp.com)

> ⚠️ **배포 후** 전송할 것. preview 토큰/피드/게이팅은 프로덕션 배포되어야 URL이 동작함.

---

안녕하세요, 푸르픽(사업자등록번호 263-13-02666) 담당자입니다.
요청하신 검수 정보 회신드립니다.

## 1. 연동 버전
**v2.1** — 주문정보 등록 API v2.1, 버튼 SDK `orderRegistrationVersion: "2.1"`.

## 2. 테스트 환경
- 운영 도메인(purrpik.co.kr)에서 네이버페이 버튼은 **일반 사용자에게 노출되지 않으며**, 아래 preview 파라미터로 접근한 검수 전용 세션에서만 노출됩니다.
- 모든 네이버페이 서비스 도메인은 test- 환경을 사용합니다:
  - 버튼 SDK: `test-pay.naver.com`
  - 주문등록 API: `test-api.pay.naver.com`
- 검수는 **전 상품(2종) 기준**으로 동작하며, 상품 상세와 장바구니 모두에서 [구매하기] 버튼이 노출됩니다.

### 테스트 상품 상세 URL
- https://www.purrpik.co.kr/shop/purrpik-shelter?npay=npayrev-df83e5bdf329fb915dc1
- https://www.purrpik.co.kr/shop/purrpik-coolmat?npay=npayrev-df83e5bdf329fb915dc1

### 테스트 장바구니 URL (상품을 담은 뒤 확인)
- https://www.purrpik.co.kr/cart?npay=npayrev-df83e5bdf329fb915dc1

> ※ 위 파라미터로 한 번 진입하면 같은 브라우저 세션 동안 전 상품·장바구니에서 버튼이 노출됩니다.

## 3. 상품정보 XML URL
- https://www.purrpik.co.kr/naverpay/products.xml

## 참고
현재 **구매하기(주문등록)만 연동**되어 있으며, 찜하기·톡톡은 미연동 상태입니다.

감사합니다.

---

# 검수 2차 회신 (최광호님 지적 반영 완료)

안녕하세요, 지적해주신 2건 모두 반영 완료했습니다.

## 1. 상품 정보 XML — 요청 상품만 반환하도록 수정
`product[N][id]` 파라미터로 요청된 상품에 대해서만 상품 정보를 반환하도록 수정했습니다(파라미터가 없으면 전체 반환).
- 예: https://www.purrpik.co.kr/naverpay/products.xml?product%5B0%5D%5Bid%5D=coolmat-s&optionSearch=true
  → `coolmat-s` 상품만 반환됩니다.

## 2. 네이버 공통 유입 스크립트 삽입 완료
가맹점 웹사이트 전역(PC/모바일)에 wcslog.js를 삽입했습니다.
- `wcs_add["wa"] = "s_1f15c4d9f0d6"`
- `wcs.checkoutWhitelist = ["purrpik.co.kr","www.purrpik.co.kr"]`
- `wcs.inflow("nfnl.kr")` + `wcs_do()`
- 전 페이지 `<head>` 로드 + 페이지뷰 전송 동작 확인했습니다.

감사합니다.

---

# 검수 3차 회신 (광고 유입 추적 연동 완료)

안녕하세요, 요청하신 광고 유입 추적 연동 완료했습니다.

## 연동 내용
NaPm 유입 시 wcslog.js가 생성하는 쿠키를 읽어 주문 등록 XML의 `<interface>` 요소 하위에 아래와 같이 연동했습니다.
- `NA_CO` 쿠키 → `interface/naverInflowCode`
- `NVADID` 쿠키 → `interface/saClickId`
- (`CPAValidator` → `interface/cpaInflowCode` 도 동일하게 연동)

값이 있을 때만 주문등록 XML에 포함되며, 일반 주문에는 포함되지 않습니다.

## 확인 방법 (버튼 노출 + 유입 쿠키 동시)
아래 URL로 접근하시면 preview 상태에서 버튼이 노출되며, NaPm 유입 쿠키(NA_CO/NVADID)도 함께 생성됩니다.

- https://www.purrpik.co.kr/shop/purrpik-shelter?npay=npayrev-df83e5bdf329fb915dc1&NaPm=ct%3Dj95fji6o%7Cci%3D0z4000000cOnNyhXXuQ9%7Ctr%3Dsa%7Chk%3Db7d4c09f35516b42e7689a9f9cb0ab096fd468c8

구매하기 클릭 시 주문등록 요청에 naverInflowCode / saClickId 가 포함되어 정상 등록(SUCCESS)됨을 확인했습니다.

감사합니다.
