/**
 * 네이버페이 주문형 — 주문 정보 등록 API (구매 정보 연동).
 * 서버 전용 (certiKey 포함) — 절대 클라이언트 컴포넌트에서 import 금지.
 *
 * 가이드: 네이버페이 가맹점 연동 가이드 2.1 (2026-02-04)
 * - 표 3-1: 등록 URL
 * - 표 3-2~3-5: XML 요소 스펙
 */

// 네이버페이 검수 완료 전까지 SANDBOX 고정.
// 최종승인 후: NAVERPAY_SANDBOX=false 로 env 설정 or 이 줄 제거.
const NAVERPAY_SANDBOX = process.env.NAVERPAY_SANDBOX !== "false";

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
 * 주문 정보 등록 request XML 빌드.
 * 전 상품 무료배송(사이트 정책) → shippingPolicy는 FREE 고정.
 */
export function buildOrderRegisterXml(input: NaverPayOrderInput): string {
  const merchantId = process.env.NAVERPAY_CENTER_ID;
  const certiKey = process.env.NAVERPAY_MERCHANT_KEY;
  if (!merchantId || !certiKey) {
    throw new Error("NAVERPAY_CENTER_ID/NAVERPAY_MERCHANT_KEY 미설정");
  }

  return `<?xml version="1.0" encoding="utf-8"?>
<order>
  <product>
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
  </product>
  <merchantId>${xmlEscape(merchantId)}</merchantId>
  <backUrl>${xmlEscape(input.backUrl)}</backUrl>
  <certiKey>${xmlEscape(certiKey)}</certiKey>
</order>`;
}

export interface NaverPayOrderResult {
  ok: boolean;
  key?: string; // response 인증키 (영문+숫자, 최대 19자)
  error?: string;
}

/** 네이버페이 주문 정보 등록 API 호출 (서버사이드). */
export async function registerNaverPayOrder(
  input: NaverPayOrderInput,
): Promise<NaverPayOrderResult> {
  const xml = buildOrderRegisterXml(input);
  try {
    const res = await fetch(NAVERPAY_ORDER_REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=UTF-8" },
      body: xml,
    });
    const text = await res.text();
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
    }
    // response 포맷 미확정(sandbox 실측 전) — <certiKey>, <key>, <authKey> 등 후보를 관대하게 탐색.
    const m =
      text.match(/<certiKey>([^<]+)<\/certiKey>/) ??
      text.match(/<key>([^<]+)<\/key>/) ??
      text.match(/<authKey>([^<]+)<\/authKey>/);
    if (!m) {
      return { ok: false, error: `인증키 파싱 실패: ${text.slice(0, 300)}` };
    }
    return { ok: true, key: m[1] };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
