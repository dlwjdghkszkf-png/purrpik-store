/**
 * TossPayments v1 API wrapper.
 * Stage 9 — 결제 confirm.
 *
 * 보안:
 *   - secretKey는 절대 클라이언트에 노출 X (서버 전용).
 *   - Basic auth = base64(secretKey + ':') — Toss 공식 인증 방식.
 *   - amount 검증은 호출 측(/api/payments/confirm)에서 수행.
 */

const TOSS_API_BASE = "https://api.tosspayments.com/v1";

export type TossPaymentStatus =
  | "READY"
  | "IN_PROGRESS"
  | "WAITING_FOR_DEPOSIT"
  | "DONE"
  | "CANCELED"
  | "PARTIAL_CANCELED"
  | "ABORTED"
  | "EXPIRED";

export interface TossConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

export interface TossConfirmResponse {
  paymentKey: string;
  orderId: string;
  orderName?: string;
  status: TossPaymentStatus;
  totalAmount: number;
  balanceAmount?: number;
  suppliedAmount?: number;
  vat?: number;
  method?: string; // '카드' | '간편결제' | etc.
  approvedAt?: string; // ISO
  requestedAt?: string;
  receipt?: { url?: string };
  // ...Toss는 더 많은 필드를 반환하지만 우리가 쓰는 건 위뿐.
  [key: string]: unknown;
}

export class TossError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "TossError";
  }
}

/**
 * Toss 결제 승인 호출.
 *
 * @throws TossError — Toss가 4xx/5xx 반환 시
 * @throws Error — 네트워크/JSON 파싱 등
 */
export async function confirmPayment(
  req: TossConfirmRequest,
): Promise<TossConfirmResponse> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    throw new TossError(
      "ENV_MISSING",
      "TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.",
      500,
    );
  }

  const auth = Buffer.from(`${secretKey}:`).toString("base64");

  const res = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
    // Route Handler에서 호출 — 캐시 X.
    cache: "no-store",
  });

  if (!res.ok) {
    let code = "TOSS_HTTP_ERROR";
    let message = `Toss API ${res.status}`;
    try {
      const err = (await res.json()) as { code?: string; message?: string };
      code = err.code ?? code;
      message = err.message ?? message;
    } catch {
      // 본문 비어있거나 JSON 아님 — 그대로 기본 메시지.
    }
    throw new TossError(code, message, res.status);
  }

  return (await res.json()) as TossConfirmResponse;
}
