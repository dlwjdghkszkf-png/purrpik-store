/**
 * 주문번호 생성기.
 * 형식: `PP-YYYYMMDD-XXXXXX`
 *   - PP — 푸르픽(Purrpik)
 *   - YYYYMMDD — 주문일 (KST 기준)
 *   - XXXXXX — 6자리 대문자+숫자 랜덤
 *
 * 충돌 가능성 ↓: 일자 + 6자리 라면 일일 ~36^6 ≈ 21억 조합.
 * Toss `orderId` 제약: 6~64자, 영문 대소문자/숫자/-/_ 만 허용 — 통과.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 헷갈리는 0/O/1/I 제외

function randomTail(length = 6): string {
  let out = "";
  // crypto.getRandomValues는 브라우저/Node 양쪽에서 사용 가능.
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(length);
    crypto.getRandomValues(arr);
    for (let i = 0; i < length; i++) {
      out += ALPHABET[arr[i] % ALPHABET.length];
    }
    return out;
  }
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

function todayKST(): string {
  // KST = UTC+9. 한국 결제는 KST 기준이라 toLocale로 단순 변환.
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = String(kst.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kst.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function generateOrderNo(): string {
  return `PP-${todayKST()}-${randomTail(6)}`;
}
