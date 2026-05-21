import type { Database } from "@/lib/supabase/types";

type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];

const STATUS_KO: Record<OrderStatus, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  shipping: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소됨",
  failed: "결제 실패",
};

export function statusLabel(s: OrderStatus): string {
  return STATUS_KO[s] ?? s;
}
