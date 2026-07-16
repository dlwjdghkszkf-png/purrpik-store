/**
 * 네이버페이 주문형 — 주문 정보 등록 API (구매 정보 연동).
 * 서버 전용 (certiKey 포함) — 절대 클라이언트 컴포넌트에서 import 금지.
 *
 * 가이드: 네이버페이 가맹점 연동 가이드 2.1 (2026-02-04)
 * - 표 3-1: 등록 URL
 * - 표 3-2~3-5: XML 요소 스펙
 */

// 네이버페이 검수 완료 전까지 SANDBOX 고정.
// 단일 소스: NAVERPAY_SANDBOX 우선, 없으면 NEXT_PUBLIC_NAVERPAY_SANDBOX 폴백 →
// 승인 시 NEXT_PUBLIC_NAVERPAY_SANDBOX 한 변수만 false로 바꿔도 client SDK와
// server 등록 엔드포인트가 함께 전환됨(둘 중 하나만 바뀌는 드리프트 방지).
const NAVERPAY_SANDBOX =
  (process.env.NAVERPAY_SANDBOX ?? process.env.NEXT_PUBLIC_NAVERPAY_SANDBOX) !==
  "false";

export const NAVERPAY_ORDER_REGISTER_URL = NAVERPAY_SANDBOX
  ? "https://test-api.pay.naver.com/o/customer/api/order/v20/register"
  : "https://api.pay.naver.com/o/customer/api/order/v20/register";

function xmlEscape(v: string | number): string {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface NaverPayOrderInput {
  productId: string; // 최대 30자, 영문숫자+특수문자(!+-/=_)
  name: string; // 최대 100자
  basePrice: number;
  quantity: number;
  infoUrl: string;
  imageUrl: string;
  backUrl: string;
}

/**
 * 광고 유입 추적 필드 (wcslog.js가 심는 쿠키 → 주문등록 연동).
 * - naverInflowCode ← NA_CO 쿠키 (네이버 유입 코드)
 * - saClickId       ← NVADID 쿠키 (검색광고 클릭 ID)
 * - cpaInflowCode   ← CPAValidator 쿠키 (지식쇼핑 CPA)
 * 값이 있을 때만 XML에 포함 — 없으면 요소 생략(유입 아닌 일반 주문).
 */
export interface NaverPayInflow {
  naverInflowCode?: string;
  saClickId?: string;
  cpaInflowCode?: string;
}

/** 클라이언트가 보낸 유입 값 정규화(문자열/길이 검증). 쿠키는 신뢰불가 입력. */
export function parseNaverPayInflow(raw: unknown): NaverPayInflow {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const pick = (v: unknown): string | undefined =>
    typeof v === "string" && v.length > 0 && v.length <= 255 ? v : undefined;
  const out: NaverPayInflow = {};
  const n = pick(o.naverInflowCode);
  const s = pick(o.saClickId);
  const c = pick(o.cpaInflowCode);
  if (n) out.naverInflowCode = n;
  if (s) out.saClickId = s;
  if (c) out.cpaInflowCode = c;
  return out;
}

/**
 * 유입 요소 XML(값 있는 것만).
 * 검수관 지정 위치: <order> 하위 <interface> 래퍼 안에 넣어야 추적됨
 * (interface/naverInflowCode, interface/saClickId). order 직속은 무시됨.
 */
function buildInflowXml(inflow?: NaverPayInflow): string {
  if (!inflow) return "";
  const inner: string[] = [];
  if (inflow.naverInflowCode) {
    inner.push(
      `    <naverInflowCode>${xmlEscape(inflow.naverInflowCode)}</naverInflowCode>`,
    );
  }
  if (inflow.saClickId) {
    inner.push(`    <saClickId>${xmlEscape(inflow.saClickId)}</saClickId>`);
  }
  if (inflow.cpaInflowCode) {
    inner.push(
      `    <cpaInflowCode>${xmlEscape(inflow.cpaInflowCode)}</cpaInflowCode>`,
    );
  }
  if (inner.length === 0) return "";
  return `\n  <interface>\n${inner.join("\n")}\n  </interface>`;
}

/**
 * 단일 <product> 요소 XML 빌드.
 * 전 상품 무료배송(사이트 정책) → shippingPolicy는 FREE 고정.
 * 옵션 없는 본상품 형태(single/quantity) — 우리 SKU 모델은 옵션조합이 이미 단일 SKU로 확정됨.
 */
function buildProductXml(input: NaverPayOrderInput): string {
  return `  <product>
    <id>${xmlEscape(input.productId)}</id>
    <name>${xmlEscape(input.name)}</name>
    <basePrice>${input.basePrice}</basePrice>
    <taxType>TAX</taxType>
    <infoUrl>${xmlEscape(input.infoUrl)}</infoUrl>
    <imageUrl>${xmlEscape(input.imageUrl)}</imageUrl>
    <single>
      <quantity>${input.quantity}</quantity>
    </single>
    <shippingPolicy>
      <method>DELIVERY</method>
      <feeType>FREE</feeType>
      <feePayType>FREE</feePayType>
      <feePrice>0</feePrice>
    </shippingPolicy>
  </product>`;
}

/**
 * 주문 정보 등록 request XML 빌드.
 * 상품 상세(단일) + 장바구니(복수 <product>) 공용 — v2.1 스펙: <order> 안에 <product> 여러 개 허용.
 */
export function buildOrderRegisterXml(
  products: NaverPayOrderInput[],
  backUrl: string,
  inflow?: NaverPayInflow,
): string {
  const merchantId = process.env.NAVERPAY_CENTER_ID;
  const certiKey = process.env.NAVERPAY_MERCHANT_KEY;
  if (!merchantId || !certiKey) {
    throw new Error("NAVERPAY_CENTER_ID/NAVERPAY_MERCHANT_KEY 미설정");
  }
  if (products.length === 0) {
    throw new Error("주문 상품이 비어있습니다");
  }
  // XML 주입 방지 + 스펙 준수 — 숫자 필드는 안전한 정수만 허용.
  for (const p of products) {
    if (!Number.isSafeInteger(p.basePrice) || p.basePrice < 0) {
      throw new Error(`basePrice 오류: ${p.basePrice}`);
    }
    if (!Number.isSafeInteger(p.quantity) || p.quantity < 1) {
      throw new Error(`quantity 오류: ${p.quantity}`);
    }
  }

  const productsXml = products.map(buildProductXml).join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<order>
${productsXml}
  <merchantId>${xmlEscape(merchantId)}</merchantId>
  <backUrl>${xmlEscape(backUrl)}</backUrl>${buildInflowXml(inflow)}
  <certiKey>${xmlEscape(certiKey)}</certiKey>
</order>`;
}

export interface NaverPayOrderResult {
  ok: boolean;
  key?: string; // response 인증키 (영문+숫자, 최대 19자)
  merchantNo?: string; // 응답의 가맹점번호 (버튼 SDK가 기대) — NAVERPAY_CENTER_ID로 임의대체 금지
  error?: string;
}

/**
 * 주문 등록 XML을 네이버페이 API로 POST하고 응답 파싱.
 * v2.1 응답 포맷(가이드 §주문등록 응답): 콜론 구분 텍스트 — XML 아님.
 *  - 성공: `SUCCESS:인증키:가맹점번호`
 *  - 실패: `FAIL:[에러코드]실패메시지`
 * (HTTP 상태와 무관하게 body 접두사로 성공/실패 판별.)
 */
async function postOrderRegister(xml: string): Promise<NaverPayOrderResult> {
  try {
    const res = await fetch(NAVERPAY_ORDER_REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=UTF-8" },
      body: xml,
    });
    const text = (await res.text()).trim();

    if (text.startsWith("SUCCESS:")) {
      // 인증키/가맹점번호 모두 콜론을 포함하지 않음(인증키=영숫자, 가맹점번호=np_...).
      // v2.1 성공 응답은 key+merchantNo 둘 다 포함 — 하나라도 없으면 실패로 처리.
      // (merchantNo를 CENTER_ID로 임의대체하면 SDK 오동작 + 가맹점ID 노출 위험.)
      const parts = text.split(":");
      const key = parts[1]?.trim();
      const merchantNo = parts[2]?.trim();
      if (!key || !merchantNo) {
        return {
          ok: false,
          error: `응답 파싱 실패(key/merchantNo 누락): ${text.slice(0, 300)}`,
        };
      }
      return { ok: true, key, merchantNo };
    }

    // FAIL:[코드]메시지 또는 예상외 응답(HTTP 4xx/5xx 포함).
    return {
      ok: false,
      error: res.ok
        ? text.slice(0, 300)
        : `HTTP ${res.status}: ${text.slice(0, 300)}`,
    };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** 단일 상품 주문 등록 (상품 상세 페이지 [구매하기]). */
export async function registerNaverPayOrder(
  input: NaverPayOrderInput,
  inflow?: NaverPayInflow,
): Promise<NaverPayOrderResult> {
  let xml: string;
  try {
    xml = buildOrderRegisterXml([input], input.backUrl, inflow);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  return postOrderRegister(xml);
}

/**
 * 장바구니 주문 등록 (장바구니 페이지 [구매하기]) — 복수 상품 한 주문으로 등록.
 * backUrl은 장바구니/주문 완료 복귀 URL.
 */
export async function registerNaverPayCartOrder(
  items: NaverPayOrderInput[],
  backUrl: string,
  inflow?: NaverPayInflow,
): Promise<NaverPayOrderResult> {
  if (items.length === 0) {
    return { ok: false, error: "장바구니가 비어있습니다" };
  }
  let xml: string;
  try {
    xml = buildOrderRegisterXml(items, backUrl, inflow);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  return postOrderRegister(xml);
}
