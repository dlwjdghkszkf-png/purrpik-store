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
