/**
 * Stage 9 — /api/payments/confirm 유닛 테스트.
 *
 * 시나리오:
 *   1) 성공 — pending order → Toss confirm OK → status=paid → 알림톡 발송 → 200 ok
 *   2) 멱등성 — order.status='paid' → Toss 미호출 → 200 idempotent
 *   3) amount mismatch — order.amount !== body.amount → 401 + admin notify
 *   4) Toss 실패 — confirmPayment throws TossError → 502 + admin notify
 *   추가:
 *   5) missing fields → 400
 *   6) order not found → 404
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// env — service client 미설정 가드를 통과하기 위함.
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.SOLAPI_KAKAO_TEMPLATE_ORDER = "TEST_TEMPLATE_001";

// ----- Mock 정의 -----
// Supabase service client — 체이닝 모킹.
const mockOrderRow = {
  id: "uuid-1",
  order_no: "PP-20260521-ABC123",
  product_id: "purrpik-shelter",
  amount: 39000,
  status: "pending" as "pending" | "paid",
  buyer_phone: "01012345678",
  alimtalk_attempts: 0,
  products: { name: "푸르픽 길고양이집" },
};

let supabaseState: {
  selectResult: { data: typeof mockOrderRow | null; error: { message: string } | null };
  updateError: { message: string } | null;
  updateCalls: Array<Record<string, unknown>>;
};

function createMockServiceClient() {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue(supabaseState.selectResult),
        })),
      })),
      update: vi.fn((payload: Record<string, unknown>) => {
        supabaseState.updateCalls.push(payload);
        return {
          eq: vi.fn().mockResolvedValue({ error: supabaseState.updateError }),
        };
      }),
    })),
  };
}

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: () => createMockServiceClient(),
}));

const confirmPaymentMock = vi.fn();
vi.mock("@/lib/toss", async () => {
  // 실제 TossError 클래스를 그대로 reuse (instanceof 체크 통과 위함).
  class TossError extends Error {
    constructor(
      public code: string,
      message: string,
      public statusCode: number,
    ) {
      super(message);
      this.name = "TossError";
    }
  }
  return {
    confirmPayment: confirmPaymentMock,
    TossError,
  };
});

const sendAlimtalkMock = vi.fn();
vi.mock("@/lib/solapi", () => ({
  sendAlimtalk: sendAlimtalkMock,
}));

// notifyAdmin → ADMIN_WEBHOOK_URL이 없으면 noop이라 별도 모킹 불필요.

// ----- Helpers -----
async function importRoute() {
  return import("@/app/api/payments/confirm/route");
}

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/payments/confirm", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  supabaseState = {
    selectResult: { data: { ...mockOrderRow }, error: null },
    updateError: null,
    updateCalls: [],
  };
  sendAlimtalkMock.mockResolvedValue({ success: true, messageId: "msg-1" });
  confirmPaymentMock.mockResolvedValue({
    paymentKey: "test_pk_123",
    orderId: mockOrderRow.order_no,
    status: "DONE",
    totalAmount: mockOrderRow.amount,
    method: "카드",
    approvedAt: "2026-05-21T12:00:00+09:00",
  });
});

describe("POST /api/payments/confirm", () => {
  it("성공: pending → Toss confirm → status=paid → 알림톡 발송 → 200 ok", async () => {
    const { POST } = await importRoute();
    const req = makeRequest({
      paymentKey: "test_pk_123",
      orderId: mockOrderRow.order_no,
      amount: mockOrderRow.amount,
    });

    // @ts-expect-error — NextRequest는 Request 기반이라 호환.
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.orderNo).toBe(mockOrderRow.order_no);
    expect(body.idempotent).toBeUndefined();
    expect(confirmPaymentMock).toHaveBeenCalledTimes(1);
    expect(sendAlimtalkMock).toHaveBeenCalledTimes(1);
    // 첫 update = paid 전환
    expect(supabaseState.updateCalls[0]).toMatchObject({
      status: "paid",
      toss_payment_key: "test_pk_123",
    });
    // 두 번째 update = 알림톡 결과
    expect(supabaseState.updateCalls[1]).toHaveProperty("alimtalk_sent_at");
    expect(supabaseState.updateCalls[1].alimtalk_sent_at).not.toBeNull();
  });

  it("멱등성: order.status='paid' → Toss 미호출 → 200 idempotent", async () => {
    supabaseState.selectResult = {
      data: { ...mockOrderRow, status: "paid" },
      error: null,
    };
    const { POST } = await importRoute();
    const req = makeRequest({
      paymentKey: "test_pk_123",
      orderId: mockOrderRow.order_no,
      amount: mockOrderRow.amount,
    });

    // @ts-expect-error — NextRequest는 Request 기반이라 호환.
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.idempotent).toBe(true);
    expect(confirmPaymentMock).not.toHaveBeenCalled();
    expect(sendAlimtalkMock).not.toHaveBeenCalled();
    expect(supabaseState.updateCalls).toHaveLength(0);
  });

  it("amount mismatch: DB amount ≠ body amount → 401", async () => {
    const { POST } = await importRoute();
    const req = makeRequest({
      paymentKey: "test_pk_123",
      orderId: mockOrderRow.order_no,
      amount: mockOrderRow.amount + 1000, // 위변조
    });

    // @ts-expect-error — NextRequest는 Request 기반이라 호환.
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("amount_mismatch");
    expect(confirmPaymentMock).not.toHaveBeenCalled();
    expect(supabaseState.updateCalls).toHaveLength(0);
  });

  it("Toss 실패: confirmPayment throws TossError → 502", async () => {
    const { TossError } = await import("@/lib/toss");
    confirmPaymentMock.mockRejectedValueOnce(
      new TossError("REJECT_CARD_COMPANY", "카드사 거부", 400),
    );

    const { POST } = await importRoute();
    const req = makeRequest({
      paymentKey: "test_pk_123",
      orderId: mockOrderRow.order_no,
      amount: mockOrderRow.amount,
    });

    // @ts-expect-error — NextRequest는 Request 기반이라 호환.
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("toss_failed");
    expect(body.code).toBe("REJECT_CARD_COMPANY");
    // DB update / 알림톡 미수행
    expect(supabaseState.updateCalls).toHaveLength(0);
    expect(sendAlimtalkMock).not.toHaveBeenCalled();
  });

  it("missing fields → 400", async () => {
    const { POST } = await importRoute();
    const req = makeRequest({ paymentKey: "x" }); // orderId, amount 누락

    // @ts-expect-error — NextRequest는 Request 기반이라 호환.
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("missing_fields");
  });

  it("order not found → 404", async () => {
    supabaseState.selectResult = {
      data: null,
      error: { message: "no rows" },
    };
    const { POST } = await importRoute();
    const req = makeRequest({
      paymentKey: "test_pk_123",
      orderId: "PP-NONEXISTENT",
      amount: 39000,
    });

    // @ts-expect-error — NextRequest는 Request 기반이라 호환.
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("order_not_found");
    expect(confirmPaymentMock).not.toHaveBeenCalled();
  });
});
