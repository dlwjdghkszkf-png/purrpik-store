"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin, clearAdminCookie } from "@/lib/admin-auth";
import { createServiceClient } from "@/lib/supabase/server";
import { sendAlimtalk } from "@/lib/solapi";
import type { OrderStatus } from "@/lib/supabase/types";

/**
 * 입금 확인 → status=paid + 결제완료 알림톡 발송.
 * 무통장입금 수동 대사(對査)용. pending 상태에서만 동작.
 */
export async function markPaid(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) return;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("*, products(name)")
    .eq("id", orderId)
    .single();

  const order = data as
    | {
        status: OrderStatus;
        buyer_phone: string | null;
        buyer_name: string;
        order_no: string;
        product_id: string;
        amount: number;
        alimtalk_attempts: number | null;
        products?: { name?: string } | null;
      }
    | null;

  if (!order || order.status !== "pending") return;

  const now = new Date().toISOString();
  await supabase
    .from("orders")
    .update({ status: "paid", toss_paid_at: now, updated_at: now })
    .eq("id", orderId);

  // 결제완료 알림톡 (env 없으면 graceful skip)
  const templateId = process.env.SOLAPI_KAKAO_TEMPLATE_ORDER ?? "";
  if (templateId && order.buyer_phone) {
    const alim = await sendAlimtalk({
      to: order.buyer_phone,
      templateId,
      variables: {
        고객명: order.buyer_name,
        주문번호: order.order_no,
        상품명:
          (order as { products?: { name?: string } }).products?.name ??
          order.product_id,
        결제금액: `${order.amount.toLocaleString("ko-KR")}원`,
      },
    });
    await supabase
      .from("orders")
      .update({
        alimtalk_sent_at: alim.success ? new Date().toISOString() : null,
        alimtalk_attempts: (order.alimtalk_attempts ?? 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  revalidatePath("/admin/orders");
}

/** 상태 변경 (배송중/배송완료/취소) — 알림톡 없음. */
export async function setStatus(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  const allowed: OrderStatus[] = [
    "paid",
    "shipping",
    "delivered",
    "cancelled",
  ];
  if (!orderId || !allowed.includes(status)) return;

  const supabase = createServiceClient();
  await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  revalidatePath("/admin/orders");
}

export async function logout() {
  await clearAdminCookie();
  redirect("/admin/login");
}
