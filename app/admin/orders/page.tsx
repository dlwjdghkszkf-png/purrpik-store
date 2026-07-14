import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/supabase/types";
import { markPaid, setStatus, logout } from "./actions";

export const metadata: Metadata = {
  title: "주문 관리",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "입금대기",
  paid: "결제완료",
  shipping: "배송중",
  delivered: "배송완료",
  cancelled: "취소",
  failed: "실패",
};

const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  shipping: "bg-blue-100 text-blue-800",
  delivered: "bg-zinc-200 text-zinc-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

interface OrderRow {
  id: string;
  order_no: string;
  created_at: string;
  buyer_name: string;
  buyer_phone: string;
  amount: number;
  quantity: number;
  payment_method: string;
  status: OrderStatus;
  product_id: string;
  ship_zipcode: string;
  ship_address1: string;
  ship_address2: string | null;
  ship_memo: string | null;
  alimtalk_sent_at: string | null;
  products?: { name?: string } | null;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear().toString().slice(2)}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_no, created_at, buyer_name, buyer_phone, amount, quantity, payment_method, status, product_id, ship_zipcode, ship_address1, ship_address2, ship_memo, alimtalk_sent_at, products(name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (data ?? []) as unknown as OrderRow[];
  // 입금대기 무통장 최상단, 그 외 최신순.
  orders.sort((a, b) => {
    const aw = a.status === "pending" ? 0 : 1;
    const bw = b.status === "pending" ? 0 : 1;
    if (aw !== bw) return aw - bw;
    return b.created_at.localeCompare(a.created_at);
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const paidCount = orders.filter((o) => o.status === "paid").length;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">주문 관리</h1>
          <p className="mt-1 text-small text-mute-1">
            입금대기{" "}
            <b className="text-amber-700">{pendingCount}</b> · 결제완료{" "}
            <b className="text-emerald-700">{paidCount}</b> · 전체 {orders.length}
          </p>
        </div>
        <form action={logout}>
          <button className="rounded-md border border-line px-3 py-2 text-small text-mute-1 hover:border-ink hover:text-ink">
            로그아웃
          </button>
        </form>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        <b>무통장입금 확인 방법:</b> 아래 <b>입금대기</b> 주문의 입금자명(주문자명)과
        금액을 내 은행 앱 입금내역과 대조 → 확인되면{" "}
        <b>[입금확인]</b> 버튼. 자동으로 결제완료 처리 + 고객에게 알림톡 발송.
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-mute-1">
              <th className="py-2 pr-3 font-medium">주문번호 / 일시</th>
              <th className="py-2 pr-3 font-medium">주문자</th>
              <th className="py-2 pr-3 font-medium">상품</th>
              <th className="py-2 pr-3 font-medium text-right">금액</th>
              <th className="py-2 pr-3 font-medium">결제</th>
              <th className="py-2 pr-3 font-medium">배송지</th>
              <th className="py-2 pr-3 font-medium">상태</th>
              <th className="py-2 font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="py-16 text-center text-mute-1">
                  주문이 없습니다.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-line/60 align-top">
                <td className="py-3 pr-3">
                  <div className="font-medium tabular-nums text-ink">
                    {o.order_no}
                  </div>
                  <div className="text-[11px] text-mute-2">
                    {fmtDate(o.created_at)}
                  </div>
                </td>
                <td className="py-3 pr-3">
                  <div className="text-ink">{o.buyer_name}</div>
                  <div className="text-[11px] text-mute-2 tabular-nums">
                    {o.buyer_phone}
                  </div>
                </td>
                <td className="py-3 pr-3 text-mute-1">
                  {o.products?.name ?? o.product_id}
                  <span className="text-mute-2"> ×{o.quantity}</span>
                </td>
                <td className="py-3 pr-3 text-right font-semibold tabular-nums text-ink">
                  {o.amount.toLocaleString("ko-KR")}
                </td>
                <td className="py-3 pr-3 text-[11px] text-mute-1">
                  {o.payment_method === "bank_transfer"
                    ? "무통장"
                    : o.payment_method === "card"
                      ? "카드"
                      : o.payment_method}
                </td>
                <td className="py-3 pr-3 text-[11px] text-mute-1">
                  ({o.ship_zipcode}) {o.ship_address1} {o.ship_address2 ?? ""}
                  {o.ship_memo ? (
                    <div className="text-mute-2">📝 {o.ship_memo}</div>
                  ) : null}
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_CLASS[o.status]}`}
                  >
                    {STATUS_LABEL[o.status]}
                  </span>
                  {o.alimtalk_sent_at && (
                    <div className="mt-1 text-[10px] text-mute-2">알림톡✓</div>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {o.status === "pending" && (
                      <form action={markPaid}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <button className="rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700">
                          입금확인
                        </button>
                      </form>
                    )}
                    {o.status === "paid" && (
                      <form action={setStatus}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="shipping" />
                        <button className="rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700">
                          배송중
                        </button>
                      </form>
                    )}
                    {o.status === "shipping" && (
                      <form action={setStatus}>
                        <input type="hidden" name="orderId" value={o.id} />
                        <input type="hidden" name="status" value="delivered" />
                        <button className="rounded-md bg-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-zinc-800">
                          배송완료
                        </button>
                      </form>
                    )}
                    {o.status !== "cancelled" &&
                      o.status !== "delivered" && (
                        <form action={setStatus}>
                          <input type="hidden" name="orderId" value={o.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <button className="rounded-md border border-red-300 px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50">
                            취소
                          </button>
                        </form>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
