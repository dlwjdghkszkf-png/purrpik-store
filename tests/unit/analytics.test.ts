/**
 * Stage 15 — analytics helper 유닛 테스트.
 *
 * 시나리오:
 *   1) window 미정의 시 noop (throw 금지)
 *   2) gtag/fbq 미로드 시 noop
 *   3) trackViewItem — gtag('event','view_item',...) + fbq('track','ViewContent',...)
 *   4) trackAddToCart — line total 계산 + 양쪽 호출
 *   5) trackBeginCheckout — 합계 + items
 *   6) trackPurchase — transaction_id 포함
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

const ITEM = {
  item_id: "basic-m",
  item_name: "BASIC M",
  price: 39000,
  quantity: 2,
};

describe("analytics — window 미정의", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("window 없으면 noop (no throw)", async () => {
    vi.stubGlobal("window", undefined);
    const mod = await import("@/lib/analytics");
    expect(() => mod.trackViewItem(ITEM)).not.toThrow();
    expect(() => mod.trackAddToCart(ITEM)).not.toThrow();
  });
});

describe("analytics — gtag/fbq 호출", () => {
  let gtag: ReturnType<typeof vi.fn>;
  let fbq: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllGlobals();
    gtag = vi.fn();
    fbq = vi.fn();
    vi.stubGlobal("window", { gtag, fbq });
  });

  it("gtag 미로드면 GA만 noop, fbq 정상", async () => {
    vi.stubGlobal("window", { fbq }); // gtag 없음
    const mod = await import("@/lib/analytics");
    mod.trackViewItem(ITEM);
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "ViewContent",
      expect.objectContaining({ content_ids: ["basic-m"] }),
    );
  });

  it("trackViewItem — gtag view_item + fbq ViewContent", async () => {
    const mod = await import("@/lib/analytics");
    mod.trackViewItem(ITEM);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "view_item",
      expect.objectContaining({
        currency: "KRW",
        value: 39000,
        items: [ITEM],
      }),
    );
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "ViewContent",
      expect.objectContaining({
        content_ids: ["basic-m"],
        content_name: "BASIC M",
        currency: "KRW",
      }),
    );
  });

  it("trackAddToCart — line total (price*qty)", async () => {
    const mod = await import("@/lib/analytics");
    mod.trackAddToCart(ITEM);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "add_to_cart",
      expect.objectContaining({ value: 78_000 }), // 39000 * 2
    );
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "AddToCart",
      expect.objectContaining({ value: 78_000 }),
    );
  });

  it("trackBeginCheckout — total + items + num_items", async () => {
    const mod = await import("@/lib/analytics");
    mod.trackBeginCheckout([ITEM], 78_000);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "begin_checkout",
      expect.objectContaining({ value: 78_000, items: [ITEM] }),
    );
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "InitiateCheckout",
      expect.objectContaining({ value: 78_000, num_items: 2 }),
    );
  });

  it("trackPurchase — transaction_id 포함", async () => {
    const mod = await import("@/lib/analytics");
    mod.trackPurchase("PP-20260521-ABC123", [ITEM], 78_000);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "purchase",
      expect.objectContaining({
        transaction_id: "PP-20260521-ABC123",
        value: 78_000,
      }),
    );
    expect(fbq).toHaveBeenCalledWith(
      "track",
      "Purchase",
      expect.objectContaining({ value: 78_000, num_items: 2 }),
    );
  });
});
