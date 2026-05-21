/**
 * Stage 15 — generateOrderNo 유닛 테스트.
 *
 * 검증:
 *   1) 형식 `PP-YYYYMMDD-XXXXXX` (정규식)
 *   2) Toss orderId 길이 제약 (6~64자) 통과
 *   3) 100회 호출 시 충돌 없음 (probabilistic — 36^6 ≈ 21억 조합)
 *   4) tail 문자 집합 — 헷갈리는 0/O/1/I 미포함
 */

import { describe, it, expect } from "vitest";
import { generateOrderNo } from "@/lib/orderNo";

const FORMAT = /^PP-\d{8}-[A-Z2-9]{6}$/;

describe("generateOrderNo", () => {
  it("형식 PP-YYYYMMDD-XXXXXX 만족", () => {
    const n = generateOrderNo();
    expect(n).toMatch(FORMAT);
  });

  it("Toss orderId 길이 제약 (6~64자) 통과", () => {
    const n = generateOrderNo();
    expect(n.length).toBeGreaterThanOrEqual(6);
    expect(n.length).toBeLessThanOrEqual(64);
    // 실제로는 18자 고정.
    expect(n.length).toBe(18);
  });

  it("100회 호출 — 중복 없음", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      seen.add(generateOrderNo());
    }
    expect(seen.size).toBe(100);
  });

  it("tail에 헷갈리는 0/O/1/I 미포함", () => {
    for (let i = 0; i < 50; i++) {
      const tail = generateOrderNo().split("-")[2];
      expect(tail).not.toMatch(/[0O1I]/);
    }
  });

  it("KST 날짜 사용 — 오늘 일자와 일치", () => {
    const n = generateOrderNo();
    const date = n.split("-")[1]; // YYYYMMDD
    // KST 기준 오늘 계산.
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(kst.getUTCDate()).padStart(2, "0");
    expect(date).toBe(`${y}${m}${d}`);
  });
});
