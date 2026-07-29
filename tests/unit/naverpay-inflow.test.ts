/**
 * 재발방지 — 네이버페이 유입 추적 필드 위치 (2026-07-16 기술지원 메일 대응).
 *
 * 배경: 초기 연동 시 naverInflowCode·saClickId를 <order> 직속에 넣어 유입 추적이
 * 안 됐다. 네이버페이 기술지원(최광호)이 "interface/naverInflowCode,
 * interface/saClickId 요소로 처리"를 요청 → 커밋 6e8059e로 <interface> 래퍼로 이동.
 *
 * 이 테스트가 지키는 불변식:
 *   1. 유입값은 <order> 하위 <interface> 래퍼 안에만 들어간다 (order 직속 금지).
 *   2. naverInflowCode ← NA_CO, saClickId ← NVADID 매핑.
 *   3. 값이 없으면 <interface> 요소 자체를 생략한다 (필수 아님, N).
 *   4. 쿠키값은 신뢰불가 입력이므로 XML 이스케이프된다.
 */

import { describe, it, expect, beforeEach } from "vitest";

process.env.NAVERPAY_CENTER_ID = "np_test_center";
process.env.NAVERPAY_MERCHANT_KEY = "test_certi_key";
process.env.NAVERPAY_SANDBOX = "true";

import {
  buildOrderRegisterXml,
  parseNaverPayInflow,
} from "@/lib/naverpay";

const PRODUCT = {
  productId: "purrpik-shelter",
  name: "푸르픽 길고양이집",
  basePrice: 29900,
  quantity: 1,
  infoUrl: "https://www.purrpik.co.kr/shop/purrpik-shelter",
  imageUrl: "https://www.purrpik.co.kr/images/products/purrpik-shelter-hero.jpg",
  backUrl: "https://www.purrpik.co.kr/cart",
};

describe("네이버페이 유입 필드 (interface 래퍼)", () => {
  it("유입값을 <order> 하위 <interface> 래퍼 안에 넣는다 (order 직속 금지)", () => {
    const xml = buildOrderRegisterXml([PRODUCT], PRODUCT.backUrl, {
      naverInflowCode: "NA_CODE_123",
      saClickId: "NVADID_456",
    });
    // interface 래퍼 안에 두 필드 존재
    expect(xml).toMatch(
      /<interface>[\s\S]*<naverInflowCode>NA_CODE_123<\/naverInflowCode>[\s\S]*<\/interface>/,
    );
    expect(xml).toMatch(
      /<interface>[\s\S]*<saClickId>NVADID_456<\/saClickId>[\s\S]*<\/interface>/,
    );
    // order 직속(interface 밖)에 유입 필드가 있으면 회귀 — 금지.
    const withoutInterface = xml.replace(/<interface>[\s\S]*<\/interface>/, "");
    expect(withoutInterface).not.toContain("naverInflowCode");
    expect(withoutInterface).not.toContain("saClickId");
  });

  it("유입값이 없으면 <interface> 요소를 생략한다 (필수 아님)", () => {
    const xml = buildOrderRegisterXml([PRODUCT], PRODUCT.backUrl, {});
    expect(xml).not.toContain("<interface>");
    const xmlNoArg = buildOrderRegisterXml([PRODUCT], PRODUCT.backUrl);
    expect(xmlNoArg).not.toContain("<interface>");
  });

  it("cpaInflowCode(지식쇼핑 CPA)도 interface 안에 포함된다", () => {
    const xml = buildOrderRegisterXml([PRODUCT], PRODUCT.backUrl, {
      cpaInflowCode: "CPA_789",
    });
    expect(xml).toMatch(
      /<interface>[\s\S]*<cpaInflowCode>CPA_789<\/cpaInflowCode>[\s\S]*<\/interface>/,
    );
  });

  it("parseNaverPayInflow: NA_CO→naverInflowCode, NVADID→saClickId 정규화", () => {
    const parsed = parseNaverPayInflow({
      naverInflowCode: "NA_CODE_123",
      saClickId: "NVADID_456",
      cpaInflowCode: "CPA_789",
      garbage: "무시",
    });
    expect(parsed).toEqual({
      naverInflowCode: "NA_CODE_123",
      saClickId: "NVADID_456",
      cpaInflowCode: "CPA_789",
    });
  });

  it("parseNaverPayInflow: 빈/과길이/비문자열 값은 버린다", () => {
    expect(parseNaverPayInflow(null)).toEqual({});
    expect(parseNaverPayInflow({ naverInflowCode: "" })).toEqual({});
    expect(parseNaverPayInflow({ saClickId: 12345 })).toEqual({});
    expect(parseNaverPayInflow({ naverInflowCode: "x".repeat(256) })).toEqual({});
  });

  it("유입값의 XML 특수문자는 이스케이프된다 (주입 방지)", () => {
    const xml = buildOrderRegisterXml([PRODUCT], PRODUCT.backUrl, {
      naverInflowCode: 'a<b>&"\'',
    });
    expect(xml).toContain("a&lt;b&gt;&amp;&quot;&apos;");
    expect(xml).not.toContain("<b>&\"");
  });
});
