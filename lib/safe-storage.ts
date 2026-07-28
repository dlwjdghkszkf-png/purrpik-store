/**
 * P1-4 (REVIEW_SOL_QA_2026-07-28): localStorage 예외 안전 어댑터.
 *
 * QuotaExceededError / SecurityError(프라이빗 모드·서드파티 차단) / 손상 JSON이
 * getItem·setItem에서 throw되면 Zustand persist 호출부로 전파돼, 그 뒤의
 * router.push()·drawer open·배너 close 같은 UI 동작이 통째로 중단된다.
 * 모든 접근을 try/catch로 감싸 persist 실패가 UI를 멈추지 않게 한다.
 */
export function createSafeStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  return {
    getItem(key: string): string | null {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key: string, value: string): void {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // quota/보안 예외 — 무시. 메모리 상태는 유지되고 UI는 계속 동작.
      }
    },
    removeItem(key: string): void {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* 무시 */
      }
    },
    // createJSONStorage는 위 3개만 사용하지만 Storage 인터페이스 형태 유지.
    key(): string | null {
      return null;
    },
    clear(): void {
      try {
        window.localStorage.clear();
      } catch {
        /* 무시 */
      }
    },
    length: 0,
  } as Storage;
}
