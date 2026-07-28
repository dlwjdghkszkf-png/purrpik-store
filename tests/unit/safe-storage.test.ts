/**
 * P1-4 회귀 방지 — lib/safe-storage.createSafeStorage.
 *
 * localStorage가 예외를 던지는 환경(프라이빗 모드·quota·서드파티 차단)에서도
 * get/set/remove가 throw하지 않아야 한다. 예외 전파가 persist 호출부의
 * 이벤트 핸들러(게이트 이동·장바구니·배너 close)를 중단시키던 버그 방지.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createSafeStorage } from "@/lib/safe-storage";

const realWindow = globalThis.window;

afterEach(() => {
  // @ts-expect-error 테스트 정리
  globalThis.window = realWindow;
  vi.restoreAllMocks();
});

function withLocalStorage(ls: Partial<Storage>) {
  // @ts-expect-error 테스트용 window 주입
  globalThis.window = { localStorage: ls };
}

describe("createSafeStorage", () => {
  it("정상 환경에선 실제 localStorage에 위임한다", () => {
    const store = new Map<string, string>();
    withLocalStorage({
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => void store.set(k, v),
      removeItem: (k) => void store.delete(k),
    });
    const s = createSafeStorage()!;
    s.setItem("a", "1");
    expect(s.getItem("a")).toBe("1");
    s.removeItem("a");
    expect(s.getItem("a")).toBeNull();
  });

  it("setItem이 throw해도 예외를 전파하지 않는다", () => {
    withLocalStorage({
      getItem: () => null,
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
      removeItem: () => {},
    });
    const s = createSafeStorage()!;
    expect(() => s.setItem("a", "1")).not.toThrow();
  });

  it("getItem이 throw하면 null을 반환한다", () => {
    withLocalStorage({
      getItem: () => {
        throw new DOMException("blocked", "SecurityError");
      },
      setItem: () => {},
      removeItem: () => {},
    });
    const s = createSafeStorage()!;
    expect(s.getItem("a")).toBeNull();
  });

  it("SSR(window 없음)에선 undefined를 반환한다", () => {
    // @ts-expect-error window 제거
    globalThis.window = undefined;
    expect(createSafeStorage()).toBeUndefined();
  });
});
