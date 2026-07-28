# sol QA 리뷰 — purrpik-store

- 리뷰일: 2026-07-28
- 대상: `app/`, `components/`, `lib/`, 관련 테스트와 Next.js 16.2.6 로컬 문서
- 요청 증상: 간헐적 `/shop` 빈 상품, 위치 미상의 무반응 버튼
- 방식: 소스 정적 전수 검토. 요청의 “파일 저장 외 다른 쉘 부작용 금지”를 지키기 위해 빌드, 테스트, 개발 서버, 라이브 사이트 쓰기 동작은 실행하지 않았다.

## 결론

`/shop` 간헐 빈 화면의 가장 가능성 높은 근본 원인은 **요청마다 수행되는 Supabase 조회의 일시 실패를 정상적인 빈 배열로 바꾸는 코드**다. `revalidate = 86400`이 선언돼 있지만 공개 데이터 조회 클라이언트가 `cookies()`를 먼저 읽고, `/shop` 자체도 `searchParams`를 읽으므로 현재 경로는 요청 시점 동적 렌더링이다. 따라서 매 진입이 Supabase 순단에 직접 노출되고, 한 번의 실패가 “등록된 상품이 없습니다”라는 정상 빈 상태로 위장된다.

“안 눌리는 버튼”에는 소스만으로 확정할 수 있는 후보가 있다.

1. 모바일 PDP에서 3초 뒤 표시되는 카카오 플로팅 버튼이 고정 구매 CTA 위에 겹친다. 카카오는 `z-50`, 구매 바는 `z-40`이라 구매 CTA 오른쪽 영역의 클릭을 카카오가 가로챈다.
2. `/about`의 “4중 구조 상세 보기”는 존재하지 않는 `/care-guide#잠자리`를 가리킨다. 실제 ID는 `shelter`다.
3. `localStorage` 쓰기가 `QuotaExceededError`/`SecurityError`를 던지면 Zustand persist 호출 뒤의 코드가 실행되지 않는다. 홈 게이트 3개 버튼은 `router.push()`에 도달하지 못하고, 장바구니 버튼은 drawer를 열지 못하며, 쿠키 동의/거부 버튼은 배너를 닫지 못한다.

별도로, 전체 QA 중 출시 차단급 결제 결함 두 건을 발견했다.

- 주문 금액·상품·옵션을 클라이언트 Zustand/localStorage 값 그대로 서버에 저장하므로 가격 위변조가 가능하다.
- 여러 카트 라인의 합계는 전액 결제하지만 주문에는 첫 번째 상품/옵션/수량만 저장한다.

## 심각도 기준

- **P0**: 금전 손실, 오배송/미배송, 결제 무결성 훼손. 즉시 출시 차단.
- **P1**: 핵심 구매/조회 동작 실패, 간헐 장애를 정상 화면으로 위장, 운영상 주문 누락.
- **P2**: 보조 동선 오작동, 장애 가시성·접근성·테스트 신뢰도 부족.

---

## P0

### P0-1. 서버가 클라이언트 가격과 상품 정보를 신뢰해 임의 가격 주문이 가능하다

근거:

- `app/checkout/page.tsx:26-27` — localStorage에 persist된 Zustand `items`와 그 합계를 사용한다.
- `app/checkout/page.tsx:79-100` — 클라이언트 상태의 `productId`, `variantId`, `quantity`, `subtotal`로 주문 입력을 만든다.
- `app/checkout/actions.ts:35-46` — ID 존재 여부와 양수 금액만 검사한다.
- `app/checkout/actions.ts:61-80` — 상품 DB 재조회나 서버 가격 계산 없이 입력값을 `orders`에 insert한다.
- `app/api/payments/confirm/route.ts:124-137` — Toss 금액을 DB `orders.amount`와만 비교한다. 그 DB 금액 자체가 이미 클라이언트 제공값이므로 카탈로그 가격 위변조를 막지 못한다.

재현 조건:

1. 상품을 카트에 담는다.
2. 브라우저 개발자 도구에서 `purrpik-cart`의 해당 라인 `price`를 `1`로 변경한다.
3. 페이지를 새로고침해 변조된 persist state를 다시 hydrate한 뒤 무통장 주문 또는 카드 결제를 진행한다.
4. 서버는 카탈로그 가격을 조회하지 않고 1원 주문을 생성한다. 카드 승인도 “클라이언트가 만든 1원 DB 주문”과 일치하므로 금액 검사를 통과할 수 있다.

`"use server"`는 신뢰 경계가 아니다. Server Action 입력은 외부 입력으로 취급해야 한다.

수정 방향:

- 서버에는 `{ productId, variantId, quantity }[]`만 보낸다.
- 서버에서 active 상품을 다시 조회하고 `parseVariants()`로 SKU를 검증한다.
- 단가, 합계, 주문명은 서버가 계산한다. 클라이언트 `price`, `amount`, `name`은 결제 판단에 사용하지 않는다.
- 수량 상한, 정수 여부, 유효하지 않은 SKU, 비활성 상품을 서버에서 거부한다.
- 계산된 주문 스냅샷과 결제 금액을 하나의 트랜잭션으로 저장한 뒤 Toss 승인 시 그 서버 계산액과 비교한다.
- 무통장과 카드가 같은 서버 가격 계산 함수를 사용해야 한다.

권장 형태:

```ts
type CheckoutLineInput = {
  productId: string;
  variantId: string;
  quantity: number;
};

// 서버 전용
async function priceCheckout(lines: CheckoutLineInput[]) {
  // 1. products 재조회
  // 2. active/is_master/SKU 검증
  // 3. DB variants 가격으로 lineTotal 계산
  // 4. 서버 계산 total과 order item snapshot 반환
}
```

### P0-2. 복수 카트를 결제해도 첫 라인 하나만 주문에 저장된다

근거:

- `lib/cart/store.ts:16-24`, `lib/cart/store.ts:42-55` — 같은 master의 서로 다른 `variantId`를 별도 카트 라인으로 정상 지원한다.
- `components/checkout/OrderReview.tsx:27-55` — UI에는 모든 라인을 보여준다.
- `app/checkout/page.tsx:79-93` — 합계는 전체 `subtotal`이지만 `firstItem`의 상품/옵션/수량만 `orderInfo`에 넣는다.
- `app/checkout/actions.ts:62-66` — 주문에는 단일 `product_id`, `variant_id`, `quantity`만 저장한다.
- `app/admin/orders/page.tsx:143-145`, `app/orders/lookup/LookupClient.tsx:97-109` — 운영자와 고객 모두 단일 상품만 보게 된다.

재현 조건:

1. `BASIC M`과 `BASIC L`을 각각 카트에 담는다.
2. 체크아웃의 주문 상품에는 둘 다 보이고 합계도 둘의 합이다.
3. 주문을 생성한다.
4. DB/admin/주문조회에는 첫 라인만 남고, 결제 금액만 두 라인의 합계다.

영향:

- 고객은 두 상품 값을 결제하지만 풀필먼트에는 한 상품만 전달된다.
- 알림톡의 상품명도 첫 상품만 사용한다.
- 환불/정산/재고의 근거 데이터가 유실된다.

수정 방향:

- `orders` 헤더와 `order_items` 상세 테이블을 분리한다.
- `order_items`에는 `product_id`, `variant_id`, 상품명 스냅샷, 단가 스냅샷, 수량, 라인 합계를 저장한다.
- 주문 헤더와 모든 상세 라인을 DB 함수/RPC 트랜잭션으로 함께 생성한다.
- admin, 주문조회, 알림톡, 분석도 `order_items`를 기준으로 바꾼다.
- `components/checkout/OrderReview.tsx:29`의 key도 `productId::variantId`로 바꾼다. 현재 같은 master의 두 SKU는 중복 React key다.

---

## P1

### P1-1. `/shop`의 일시적 조회 실패가 정상 빈 카탈로그로 위장된다

근거:

- `app/shop/page.tsx:49-57` — Supabase error와 throw 모두 `[]`로 변환한다.
- `app/shop/page.tsx:143-155` — 그 결과를 “등록된 상품이 없습니다”라는 정상 빈 상태로 렌더한다.
- `app/shop/page.tsx:16-17` — 24시간 ISR 의도를 주석과 `revalidate`로 선언했지만 실제 공개 조회는 cookie-aware 클라이언트를 사용한다.
- `lib/supabase/server.ts:12-31` — 모든 `createClient()`가 `cookies()`를 호출한다.
- `app/shop/page.tsx:71-84` — `searchParams`도 읽는다.
- `app/` 아래 `error.tsx`가 없고, 해당 catch는 예외를 다시 던지지 않는다.
- Sentry 요청 오류 hook은 `instrumentation.ts:17-18`에 있지만, 예외를 삼키므로 자동 capture 대상이 되지 않는다.

Next.js 16.2.6의 이 레포 설정은 `cacheComponents`를 켜지 않은 “previous caching model”이다. 로컬 문서 `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`는 `cookies()` 사용이 route를 dynamic rendering으로 전환한다고 명시한다. `searchParams` 역시 request-time API다. 따라서 현재 `revalidate = 86400`만으로 Supabase SDK 조회가 24시간 보호되는 구조가 아니다.

재현 조건:

- Supabase/PostgREST 요청 한 번을 네트워크 오류, 5xx, timeout, 일시적 DNS 실패로 실패시킨 뒤 `/shop`에 진입한다.
- HTTP 페이지 자체는 성공하고 상품 0개 화면이 나온다.
- 다음 요청은 정상일 수 있으므로 curl 10회가 모두 성공해도 이 구조적 원인을 반박하지 못한다.

판정:

- **고신뢰 근본 원인**이다.
- 다만 현재 로그는 `console.warn`뿐이고 실패를 구조화해 보존하지 않아, 과거 실제 발생 건이 timeout/5xx/RLS 중 무엇이었는지는 사후 확정할 수 없다.
- RLS/스키마 오류는 보통 지속적이고, 관측 증상은 간헐적이므로 네트워크/Supabase 일시 장애가 더 잘 맞는다.

수정 방향은 뒤의 “`/shop` 방어 설계” 절에 정리한다.

### P1-2. PDP의 일시적 Supabase 실패가 영구 상품 부재와 같은 404가 된다

근거:

- `app/shop/[id]/page.tsx:29-30` — 명시적으로 `force-dynamic`.
- `app/shop/[id]/page.tsx:42-60` — DB error/throw를 모두 `null`로 바꾼다.
- `app/shop/[id]/page.tsx:164-173` — `null`이면 `notFound()`.
- `app/shop/[id]/page.tsx:113-125` — metadata 생성도 같은 조회를 사용하고 실패를 “상품을 찾을 수 없습니다”로 바꾼다.
- 리뷰와 FAQ도 `app/shop/[id]/page.tsx:76-109`에서 장애를 빈 데이터로 바꾼다.

재현 조건:

- `/shop/purrpik-shelter` 진입 시 상품 조회 한 번만 실패시킨다.
- 실제 상품이 존재해도 404가 렌더된다.

수정 방향:

- 성공한 조회의 0 row만 `notFound()`로 보낸다.
- transport/5xx/timeout/RLS 오류는 예외로 유지해 `error.tsx`가 재시도 UI를 보여주게 한다.
- 공개 상품 조회를 cookie-less cached 함수로 통합한다.
- `generateMetadata()`와 page가 같은 loader를 사용하고 React `cache()`로 한 render pass 안에서 dedupe되게 한다.

### P1-3. 모바일 PDP에서 카카오 버튼이 구매 CTA의 클릭 영역을 가로챈다

근거:

- `components/pdp/StickyBuyBar.tsx:59-80` — 모바일 구매 바가 `fixed bottom-0 z-40`, CTA가 우측에 있다.
- `components/layout/KakaoChannelButton.tsx:18-21` — 진입 3초 뒤 표시된다.
- `components/layout/KakaoChannelButton.tsx:30-41` — `fixed bottom-6 right-6 z-50`, 크기 56×56이다.
- 카카오는 구매 바보다 z-index가 높고 구매 CTA의 우하단과 실제 좌표가 겹친다.

재현 조건:

1. `lg` 미만 모바일 viewport에서 PDP에 진입한다.
2. 3초 기다린다.
3. 하단 “옵션 선택” 버튼의 오른쪽 부분을 누른다.
4. 옵션 sheet 대신 카카오 창이 열리거나, 사용자는 구매 버튼이 잘못 동작한다고 느낀다.

수정 방향:

- PDP에 고정 구매 바가 있을 때 카카오 버튼을 구매 바 위로 올린다.
- 예: `bottom: calc(76px + env(safe-area-inset-bottom) + 16px)`.
- 옵션 sheet/cart drawer/dialog가 열린 동안 카카오 버튼을 숨기거나 `pointer-events-none` 처리한다.
- 가장 안정적인 방법은 layout에 현재 route/overlay 상태를 전달해 floating action의 위치와 노출을 한 곳에서 관리하는 것이다.
- 모바일 E2E에서 두 요소의 `boundingBox()`가 교차하지 않는지 검사한다.

### P1-4. localStorage 예외가 실제 버튼 핸들러를 중단한다

근거:

- `lib/pet-type/store.ts:35-43`, `lib/cart/store.ts:83-89` — Zustand JSON storage가 raw `localStorage`를 사용한다.
- Zustand 5.0.13의 `createJSONStorage()`는 storage 취득만 try/catch하고, `getItem`/`setItem` 예외는 호출 경로로 돌려보낸다.
- `components/gate/PetCard.tsx:39-42` — `setPetType()` 다음에 `router.push()`가 있다. persist write가 throw하면 navigation에 도달하지 않는다.
- `components/pdp/AddToCartButton.tsx:69-75` — `addItem()`이 throw하면 drawer open과 완료 피드백에 도달하지 않는다.
- `components/pdp/MobileOptionSheet.tsx:87-109` — 같은 이유로 후속 sheet close/mini-cart open이 중단될 수 있다.
- `components/layout/CookieBanner.tsx:42-57` — localStorage read/write가 전혀 보호되지 않는다. 쓰기 실패 시 동의/거부 모두 배너를 닫지 못한다.
- `lib/pet-type/store.ts:40-42` — rehydrate 오류 때 `state`가 없으면 `hydrated`가 영원히 false다.

재현 조건:

```js
// 브라우저에서 fault injection 개념
Storage.prototype.setItem = () => {
  throw new DOMException("quota", "QuotaExceededError");
};
```

이후 홈 게이트 카드, 장바구니 담기, 쿠키 동의/거부를 클릭한다.

정상 환경 hydration 판정:

- `app/cart/page.tsx:16-29`와 `app/checkout/page.tsx:29-76`은 mount gate가 있다.
- `components/layout/Header.tsx:14-20`은 카트 badge를 mount 뒤에만 보여준다.
- pet badge도 `hydrated`를 확인한다.
- cart의 `isOpen`은 persist 대상이 아니므로 SSR 때 닫힌 상태와 일치한다.
- 따라서 **정상 localStorage 환경에서 hydration mismatch가 사이트 전체 버튼 무반응을 만드는 증거는 없다.**
- 문제는 hydration 자체보다 storage 오류가 이벤트 핸들러 밖으로 전파되는 실패 경로다.

수정 방향:

- `getItem`, `setItem`, `removeItem`, JSON parse를 각각 try/catch하는 safe storage adapter를 만든다.
- 손상 JSON은 해당 key를 제거하고 기본 상태로 hydrate한다.
- persist 실패가 UI 상태 변경이나 navigation을 중단하지 않게 한다.
- pet store는 rehydrate error에서도 `hydrated=true`가 되도록 별도 hydration 상태를 관리한다.
- 쿠키 배너도 storage 실패 시 메모리 상태로 닫히고, 필요한 경우 session cookie 등 대체 저장을 사용한다.
- storage-denied와 corrupt-JSON 테스트를 추가한다.

### P1-5. 이메일을 입력하지 않은 정상 구매자는 주문 조회를 사용할 수 없다

근거:

- `components/checkout/AddressForm.tsx:115-123` — 이메일을 명시적으로 선택 항목으로 표시한다.
- `app/checkout/actions.ts:69-72` — 빈 이메일을 `null`로 저장한다.
- `app/orders/lookup/LookupClient.tsx:54-63` — 이메일 입력은 required다.
- `app/orders/lookup/actions.ts:55-60` — `buyer_email = 입력 이메일`을 필수 조회 조건으로 사용한다.
- `app/order/success/page.tsx:126-129` — “주문 상세 보기” 링크에 `orderNo` query를 넣지만 `LookupClient`는 query를 읽지 않아 주문번호조차 미리 채워지지 않는다.

재현 조건:

1. 이메일 없이 정상 주문한다.
2. 헤더 또는 완료 페이지에서 주문 조회로 이동한다.
3. 조회 폼은 이메일을 요구하고, DB에는 이메일이 null이므로 성공 가능한 입력이 없다.

수정 방향:

- 이메일을 결제 필수로 바꾸거나, 더 나은 방법으로 `주문번호 + 전체 휴대폰 번호` 또는 안전한 주문 조회 토큰을 사용한다.
- 완료 페이지 링크의 `orderNo`를 폼 초기값에 반영한다.
- 무통장/카드, 이메일 있음/없음 각각 성공 E2E를 만든다.

### P1-6. 임의/존재하지 않는 무통장 주문 URL도 성공 화면을 띄우고 카트를 비운다

근거:

- `app/order/bank-transfer/page.tsx:19-20` — `orderId` 문자열 존재만 확인한다.
- `app/order/bank-transfer/page.tsx:22-33` — 조회 실패 또는 미존재 주문을 `null`로 둔다.
- `app/order/bank-transfer/page.tsx:35-42` — 주문이 없어도 “주문이 접수됐어요”를 렌더한다.
- `app/order/bank-transfer/page.tsx:37` — 그 상태에서도 `ClearCartOnMount`가 카트를 지운다.

재현 조건:

- 상품이 든 브라우저에서 `/order/bank-transfer?orderId=anything`으로 직접 이동한다.
- 성공 메시지가 나오고 카트가 삭제된다.

수정 방향:

- 주문이 실제로 존재하고 `payment_method=bank_transfer`, 허용 상태인지 확인한 뒤에만 성공 화면과 clear를 렌더한다.
- 조회 transport 오류는 404가 아니라 재시도 가능한 error UI로 분리한다.
- 미존재 주문은 `notFound()`, 일시 장애는 throw, 성공 주문만 clear한다.

### P1-7. 관리자 주문 조회 장애가 “주문 없음”으로 위장된다

근거:

- `app/admin/orders/page.tsx:60-69` — Supabase `error`를 받지 않고 `data ?? []`로 처리한다.
- `app/admin/orders/page.tsx:120-125` — 장애 시에도 “주문이 없습니다”를 표시한다.

영향:

- 실제 주문이 있는데 운영자가 없다고 판단해 입금 확인/배송을 놓칠 수 있다.

수정 방향:

- query error를 반드시 분기하고 명시적 운영 장애 화면을 보여준다.
- 서버 Sentry에 capture하고 retry 버튼을 제공한다.
- “0 rows 성공”과 “조회 실패”를 같은 배열로 표현하지 않는다.

---

## P2

### P2-1. `/about` CTA의 hash가 존재하지 않는다

- `app/about/page.tsx:105-108` — `/care-guide#잠자리`
- `app/care-guide/page.tsx:111` — 실제 섹션 ID는 `shelter`

수정: `/care-guide#shelter`로 바꾼다.

### P2-2. 상품 외 공개 데이터도 장애를 빈 상태로 위장한다

| 화면/컴포넌트 | 실패를 숨기는 위치 | 사용자에게 보이는 오해 |
|---|---:|---|
| `/both` 상품 | `app/both/page.tsx:37-44` | 실제 장애인데 “곧 출시” |
| `/reviews` | `app/reviews/page.tsx:40-48` | 실제 장애인데 리뷰 0개/조건 불일치 |
| `/faq` | `app/faq/page.tsx:26-33` | 실제 장애인데 “데이터 연결 대기 중” |
| 홈 master 상품 | `components/home/EditionGrid.tsx:31-38` | 상품 CTA 전체가 placeholder |
| 홈 FAQ | `components/home/FaqSection.tsx:22-29` | “데이터 연결 대기 중” |
| 홈 리뷰 | `components/home/ReviewsCarousel.tsx:16-23` | placeholder 4개 |
| 홈 Instagram | `components/home/InstagramFeed.tsx:37-44` | fallback 사진으로 장애가 완전히 숨음 |
| PDP 리뷰 | `app/shop/[id]/page.tsx:76-87` | “첫 리뷰” 또는 0건 |
| PDP FAQ | `app/shop/[id]/page.tsx:99-109` | “데이터 연결 대기 중” |
| 무통장 완료 주문 조회 | `app/order/bank-transfer/page.tsx:22-33` | 금액만 사라지고 성공처럼 보임 |

Instagram의 시각 fallback 자체는 유용하지만 운영 장애 telemetry는 별도로 남겨야 한다.

### P2-3. 네이버페이 SDK 실패가 빈 공간으로 끝난다

- `lib/naverpay-client.ts:159-171` — SDK create rejection을 빈 catch로 삼킨다.
- `lib/naverpay-client.ts:179-190` — 6초 내 SDK가 안 뜨면 조용히 포기한다.
- `components/pdp/NaverPayButton.tsx:76-78`, `components/cart/NaverPayCartButton.tsx:70-72` — 노출 조건을 통과하면 최소 높이의 빈 container만 남는다.

승인 후 또는 preview 검수에서 “네이버페이 버튼이 안 눌린다/안 뜬다”로 관측될 수 있다.

수정 방향:

- script `onerror`, poll timeout, `create()` rejection을 상태와 Sentry에 기록한다.
- 사용자에게 일반 결제 CTA는 계속 제공하되 네이버페이 영역에는 재시도/일시 사용 불가 메시지를 표시한다.

### P2-4. DB와 목록은 확장 가능하지만 PDP는 ID 두 개만 허용한다

- `app/shop/page.tsx:33-38` — 모든 active master를 목록에 표시한다.
- `app/shop/[id]/page.tsx:24-27`, `app/shop/[id]/page.tsx:160-162` — `purrpik-shelter`, `purrpik-coolmat` 외에는 404다.

새 master를 DB에 추가하면 카드가 나타나지만 클릭 시 404가 된다. 존재 여부는 DB의 성공한 조회로 판단하고, legacy redirect 목록만 코드에 유지하는 편이 안전하다.

### P2-5. 중간 viewport에서 데스크탑 메가 메뉴가 헤더 중앙을 침범할 가능성이 높다

- `components/layout/Header.tsx:25-44` — 헤더는 3등분 grid다.
- `components/layout/MegaMenu.tsx:178-203` — `md`부터 5개 메뉴와 4개의 `gap-8`을 한 줄로 표시한다.

768px 부근에서 왼쪽 grid 칸은 약 245px지만 메뉴 필요 폭은 대략 400px다. 로고/우측 컨트롤과 시각·클릭 영역이 충돌할 후보다.

수정 방향:

- desktop mega nav breakpoint를 `lg` 이상으로 올리거나 헤더를 `auto 1fr auto` 구조로 바꾼다.
- 768, 820, 912, 1024px에서 로고/메뉴/주문조회/카트의 bounding box 교차를 테스트한다.

### P2-6. FAQ filter sticky가 전역 sticky header 뒤에 숨는다

- `components/layout/Header.tsx:23` — header `sticky top-0 z-50`, 높이 64px.
- `app/faq/FaqClient.tsx:56` — filter bar `sticky top-0 z-10`.

스크롤 시 filter bar가 header 뒤로 들어간다. `top-16` 또는 전역 header-height CSS 변수를 사용한다.

### P2-7. 테스트가 현재 핵심 장애를 성공으로 인정한다

- `tests/e2e/home-to-checkout.spec.ts:20-40`
  - PDP 404를 정상 허용한다.
  - radio/button이 없으면 검증을 건너뛴다.
  - 카트 추가가 안 돼도 `/checkout|/cart` 둘 다 통과한다.
- `tests/e2e/shop-filter.spec.ts:11-21`
  - 필터 URL만 확인하고 최소 1개 상품 존재나 오류 UI를 확인하지 않는다.
- `tests/e2e/visual.spec.ts:26-44`
  - desktop만 검사한다.
  - 1.5초 후 캡처하므로 3초 뒤 나타나는 카카오 버튼과 모바일 구매 바 충돌을 놓친다.
- `tests/e2e/orders-lookup.spec.ts:10-29`
  - required validation만 검사하고 실제 성공 주문 조회를 검사하지 않는다.
- `tests/unit/payments-confirm.test.ts:173-189`
  - “DB amount와 Toss body가 다르면 거부”만 검증한다. DB amount가 서버 카탈로그 가격에서 계산됐는지는 검증하지 않는다.
- `tests/unit/cart-store.test.ts:18-31`
  - storage가 항상 성공하는 stub만 사용한다.

필수 추가 테스트:

1. Supabase 첫 요청 실패 후 retry 성공.
2. retry도 실패하면 빈 상품이 아니라 error UI.
3. cached last-known-good가 있는 revalidation 실패.
4. 실제 존재 상품의 일시 실패가 404가 되지 않음.
5. 모바일 PDP 구매 CTA와 카카오 버튼 비중첩.
6. localStorage read/write/corrupt JSON fault injection.
7. 임의 가격/유효하지 않은 SKU/비활성 상품 server rejection.
8. 복수 SKU 주문이 `order_items`에 모두 저장됨.
9. 이메일 없는 주문 조회 성공 또는 checkout 이메일 required 일치.
10. 임의 bank-transfer URL이 카트를 비우지 않음.

---

## 유력 용의자 4개 판정

| 용의자 | 판정 | 근거 요약 |
|---|---|---|
| 1. Supabase silent-fail | **확정** | 상품, 리뷰, FAQ, 홈 데이터 전반에서 error/throw를 `[]`/`null`로 정상화한다. `/shop` 증상과 직접 일치한다. |
| 2. cookie client로 전부 dynamic | **확정, 단서 있음** | 공개 RSC 조회는 `cookies()` 때문에 dynamic이다. `/shop`은 `searchParams` 때문에도 dynamic이므로 page 전체 정적화보다 **공개 DB loader 캐시**가 핵심이다. |
| 3. client interaction dead spot | **확정 후보 2건 + 조건부 후보** | 모바일 Kakao/PDP 구매 CTA 겹침, `/about` broken hash는 확정. storage 예외와 SDK 실패는 조건부. 나머지 주요 컨트롤은 handler/primitive 연결이 확인됐다. |
| 4. hydration 실패 | **정상 경로는 기각, 오류 경로는 확인** | mounted/hydrated gate는 대체로 올바르다. 다만 storage read/write/JSON 오류가 hydrate를 멈추거나 클릭 핸들러를 throw시킨다. |

---

## “안 눌리는 버튼” 컴포넌트 전수 목록

소스상의 literal interaction occurrence를 전수 검색했다: native `<button>` 34개, 공용 `<Button>` 28개, `<Link>` 36개, `<a>` 7개. 여기에 Radix Sheet/Dialog/Accordion/Checkbox trigger를 별도로 추적했다. 아래 “정상”은 handler, form action, href 또는 Radix primitive 연결이 코드상 존재한다는 뜻이며, 실제 외부 서비스 가용성까지 보장한다는 뜻은 아니다.

### 확정/고위험 후보

| 컴포넌트/페이지 | 컨트롤 | 판정 | 재현 조건 |
|---|---|---|---|
| `StickyBuyBar.tsx` + `KakaoChannelButton.tsx` | 모바일 “옵션 선택” | **클릭 영역 가로채기 확정** | 모바일 PDP, 진입 3초 후 CTA 오른쪽 클릭 |
| `app/about/page.tsx` | “4중 구조 상세 보기” | **목적지 hash 불일치 확정** | 클릭해도 잠자리 섹션으로 스크롤되지 않음 |
| `PetCard.tsx` | 고양이/강아지/둘 다 3개 | **storage 오류 시 무반응** | localStorage `setItem` throw |
| `CookieBanner.tsx` | 동의/거부 | **storage 오류 시 무반응** | localStorage read/write throw |
| `AddToCartButton.tsx` | 담기/바로 결제 | **storage 오류 시 후속 동작 중단** | localStorage `setItem` throw |
| `MobileOptionSheet.tsx` | 바텀시트 장바구니 담기 | **storage 오류 시 sheet/drawer 후속 중단** | localStorage `setItem` throw |
| `CartLine.tsx`, `MiniCartDrawer.tsx` | 수량/삭제 | **storage 오류 시 예외** | localStorage `setItem` throw |
| `NaverPayButton.tsx`, `NaverPayCartButton.tsx` | SDK 생성 버튼 | **SDK 실패 시 조용히 소실** | CSP/네트워크/SDK create 실패 |
| `BankTransferPanel.tsx`, `TossWidget.tsx` | 주문/결제 | **의도적 disabled이나 “왜”가 약함** | 주소 상세/전화/필수동의 누락; Toss 미마운트 |

### 구현 연결이 확인된 컨트롤

| 컴포넌트/페이지 | 확인 결과 |
|---|---|
| `components/layout/Header.tsx` | 장바구니 버튼은 `setOpen(true)`, 주문조회/계정/로고는 Link. 정상. |
| `components/layout/MegaMenu.tsx` | 모바일 SheetTrigger와 모든 Link 연결. pathname 변경 시 close. 기존 잔존 버그 수정 확인. |
| `components/layout/MiniCartDrawer.tsx` | 닫기, 수량±, 삭제, checkout/cart/shop 링크 연결. storage 예외 외 정상. |
| `components/layout/AccountLink.tsx` | auth 로딩 중에도 `/login` href가 있어 dead하지 않음. auth promise rejection UI는 없음. |
| `components/layout/PetTypeBadge.tsx` | clear + `/?gate=1` push 연결. rehydrate 실패 시 배지 자체가 숨는 조건부 문제. |
| `components/layout/CookieBanner.tsx` | 평상시 동의/거부 handler 정상. storage 보호만 없음. |
| `components/layout/KakaoChannelButton.tsx` | `window.open` 연결. 단, 모바일 구매 CTA와 위치 충돌. |
| `components/layout/Footer.tsx` | 뉴스레터 submit 연결. 이메일+동의 전 disabled는 의도적이며 UI에 동의 조건이 보임. |
| `components/auth/SocialLoginButtons.tsx` | Kakao/Google OAuth handler와 오류 alert 연결. 외부 provider 설정 실패는 별도 운영 조건. |
| `components/gate/PetCard.tsx` | 평상시 store set + router push 정상. storage throw 순서만 취약. |
| `components/pdp/OptionPicker.tsx` | 옵션 radio, 수량± 모두 handler 연결. 1/99에서 disabled는 정상. |
| `components/pdp/MobileOptionSheet.tsx` | 닫기, 옵션, 수량, 담기 모두 handler 연결. 선택 조합 없음/수량 경계 disabled는 정상. |
| `components/pdp/StickyBuyBar.tsx` | master 상품 sheet open 정상. non-master fallback은 대상 radiogroup이 없으면 no-op이지만 현재 PDP는 variants 없으면 404라 실경로에서 도달하지 않음. |
| `components/pdp/AddToCartButton.tsx` | 담기와 바로 결제 handler 정상. `selectedSku=null`/transition 중 disabled는 정상. |
| `components/pdp/Gallery.tsx` | 모든 thumbnail이 `setActive(i)`에 연결. |
| `components/pdp/FaqSection.tsx`, `components/home/FaqSection.tsx` | Radix AccordionTrigger 연결. 데이터 장애 시 항목 자체가 없어지는 문제가 별도 존재. |
| `components/pdp/ReviewsHero.tsx`, `components/pdp/ReviewsSection.tsx` | 리뷰 Link href 정상. |
| `components/cart/CartLine.tsx` | 수량±/삭제 handler 정상. 수량 1에서 감소는 라인 삭제라는 현재 설계. |
| `components/cart/CartSummary.tsx` | checkout/shop Link 정상. |
| `components/cart/NaverPayCartButton.tsx` | SDK mount 경로 연결. review mode/키/빈 카트에서는 의도적으로 미노출. 실패 UI 없음. |
| `components/checkout/AddressForm.tsx` | 주소검색은 Dialog open, Daum `onComplete` 연결. 외부 chunk/Daum 실패에 대한 로컬 retry UI는 없음. |
| `components/checkout/BankTransferPanel.tsx` | ready일 때 Server Action 호출, 오류 메시지 연결. |
| `components/checkout/TossWidget.tsx` | widget mount 뒤 결제 handler 연결, init 실패 메시지 존재. |
| `components/checkout/OrderReview.tsx` | “주문 변경” Link 정상. 복수 SKU key 중복은 별도 P0 연관 문제. |
| `components/dog/ComingSoonHero.tsx` | 알림 가입 submit, checkbox, Instagram, cat Link 정상. 가입 버튼 disabled 조건은 명시됨. |
| `components/shop/ProductCard.tsx` | 카드 전체가 PDP Link. PDP hard-coded ID whitelist와의 불일치 가능성은 별도 P2. |
| `components/shop/FilterBar.tsx` | 모든 버튼 handler 정상. 현재 `/shop`에서 import되지 않는 휴면 컴포넌트다. |
| `app/faq/FaqClient.tsx` | 카테고리 버튼과 FAQ Accordion 정상. sticky offset 문제 별도. |
| `app/orders/lookup/LookupClient.tsx` | submit handler 정상. 조회 자격 조건 불일치로 정상 고객이 성공할 수 없는 P1이 별도 존재. |
| `app/checkout/page.tsx` | 무통장/카드 탭 handler 정상. 카드 키 없을 때 카드 탭 숨김 수정 확인. |
| `app/account/page.tsx` | 로그아웃은 form Server Action에 연결. |
| `app/admin/login/page.tsx`, `app/admin/orders/page.tsx` | 버튼은 모두 form Server Action에 연결. plain button이라 handler가 없어 보이지만 dead control이 아님. |
| `components/home/VideoHero.tsx` | `/shop` Link와 `#layer4` anchor 모두 유효. |
| `components/home/EditionGrid.tsx` | master/SKU Link 정상. 데이터 실패 시 링크 전체가 사라짐. |
| `components/home/Stories.tsx`, `components/home/GiveBack.tsx` | Link 연결 정상. |
| `app/give-back/page.tsx`, `app/care-guide/page.tsx`, `app/order/*` | CTA Link 연결 정상. 단 bank-transfer 존재 검증과 success 조회 prefill 문제는 별도 항목 참조. |
| `components/ui/sheet.tsx`, `dialog.tsx`, `accordion.tsx`, `checkbox.tsx` | Radix primitive에 위임된 trigger/close/toggle로 연결돼 있다. |
| `app/dev/design-system/page.tsx` | 데모 Button 다수는 의도적으로 handler가 없다. production에서는 `app/dev/design-system/page.tsx:48-52`의 `notFound()`로 숨는다. |

---

## `/shop` 방어 설계

### 1. 공개 데이터 전용 cookie-less client 분리

인증이 필요 없는 `products`, `reviews`, `faqs`, `instagram_posts` read는 `lib/supabase/server.ts`의 세션 client를 사용하지 않는다.

예시 구조:

```ts
// lib/supabase/public.ts — server only
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
```

계정, 로그인, OAuth, 사용자별 RLS read만 기존 cookie-aware client를 유지한다.

### 2. 현재 설정에서는 `unstable_cache`로 DB loader를 캐시

이 레포는 `cacheComponents`가 꺼져 있으므로 당장 쓸 API는 Next 16의 `unstable_cache`다. `'use cache'`는 `cacheComponents` 마이그레이션을 함께 할 때 선택한다.

```ts
import { unstable_cache } from "next/cache";

export const getMasterProducts = unstable_cache(
  async () => {
    const { data, error } = await queryWithRetry(() =>
      createPublicClient()
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("is_master", true)
        .order("display_order", { ascending: true }),
    );

    if (error) throw error; // 절대로 []로 바꾸지 않음
    return data ?? [];      // 성공한 0 rows만 진짜 빈 상태
  },
  ["public-master-products-v1"],
  { revalidate: 86400, tags: ["products"] },
);
```

`/shop`은 작은 카탈로그이므로 전체 master 목록 하나를 캐시하고 pet filter는 메모리에서 적용하는 방식이 가장 단순하다. 데이터가 커지면 filter 인자를 cache key에 포함한다.

중요:

- 실패 시 `[]`/`null`을 반환한 뒤 cache하면 **장애 결과를 24시간 캐시**하게 된다.
- retry 후에도 실패하면 throw해야 한다.
- Next ISR 문서상 revalidation 중 throw가 발생하면 마지막 성공 데이터를 계속 제공하고 다음 요청에서 다시 revalidate한다.

### 3. 제한적 retry와 timeout

- 네트워크 예외, timeout, 429, 5xx만 1~2회 retry한다.
- 100~300ms exponential backoff + jitter 정도면 충분하다.
- RLS 거부, invalid column, schema 오류 같은 4xx는 즉시 실패시킨다.
- Supabase query에 abort signal/timeout을 적용해 무한 대기를 막는다.

### 4. 빈 상태와 장애 UI 분리

- 조회 성공 + 0 rows: 기존 “등록된 상품이 없습니다”.
- 조회 실패 + stale cache 있음: stale 상품을 계속 제공하고 서버에 장애 기록.
- 조회 실패 + cache 없음: `app/shop/error.tsx`에서 “상품을 불러오지 못했습니다”와 `다시 시도` 제공.
- PDP 성공 + 0 row: 404.
- PDP 조회 실패: 404가 아니라 error boundary.

### 5. 관측성

현재 `console.warn`은 서버 로그에만 있고 silent catch 때문에 Sentry 자동 capture가 되지 않는다.

최소 기록 필드:

- route, query kind, filter/product ID
- Supabase error code/message/details
- attempt 수, elapsed ms, timeout 여부
- cache hit/miss/revalidate 여부
- request correlation ID

상품/주문 원문이나 개인정보는 보내지 않는다.

---

## 수정 우선순위

1. **즉시 출시 차단:** 서버 가격 재계산 + `order_items` 도입(P0 두 건).
2. **즉시 UI hotfix:** 모바일 PDP에서 카카오 버튼을 구매 바 위로 이동/숨김.
3. **카탈로그 안정화:** 공개 cookie-less loader + `unstable_cache` + throw-on-error + error boundary.
4. **PDP 404 분리:** missing과 unavailable을 구분.
5. **storage 안전화:** safe adapter, cookie banner 보호, corrupt JSON/fault tests.
6. **주문 후속 동선:** 이메일 없는 주문 조회, bank-transfer 존재 검증, prefill.
7. **운영/보조 데이터:** admin error UI, reviews/FAQ 등 silent-fail 제거.
8. **회귀 테스트 강화:** 현재 soft-pass E2E를 실제 핵심 동작 assertion으로 교체.

## 최종 판정

- `/shop` 간헐 빈 화면: **코드상 근본 원인 확인, P1**.
- 안 눌리는 버튼: **모바일 PDP 클릭 가로채기와 broken hash 확인**, storage 오류 조건부 dead handler 확인.
- hydration: **정상 경로의 주원인은 아님**. storage 오류 처리 부족이 실제 취약점.
- 결제: 요청 범위를 넘어설 수 있어도 반드시 보고해야 하는 **P0 두 건**이 존재한다.
