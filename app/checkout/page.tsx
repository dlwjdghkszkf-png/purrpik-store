"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AddressForm,
  EMPTY_ADDRESS,
  isFormReady,
  type AddressFormValue,
} from "@/components/checkout/AddressForm";
import { OrderReview } from "@/components/checkout/OrderReview";
import { TossWidget } from "@/components/checkout/TossWidget";
import {
  selectCartSubtotal,
  useCartStore,
} from "@/lib/cart/store";
import { generateOrderNo } from "@/lib/orderNo";
import { trackBeginCheckout } from "@/lib/analytics";

const PAGE_TITLE = "결제 — 푸르픽";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectCartSubtotal);

  const [hydrated, setHydrated] = useState(false);
  const [address, setAddress] = useState<AddressFormValue>(EMPTY_ADDRESS);

  // 페이지 라이프타임 동안 안정적인 orderId — 새로고침 시 새로 생성.
  const orderId = useMemo(() => generateOrderNo(), []);

  useEffect(() => {
    setHydrated(true);
    document.title = PAGE_TITLE;
  }, []);

  // 빈 카트 → /cart 리다이렉트 (hydration 이후).
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  // Stage 14: hydration 직후, 카트 아이템 있을 때 begin_checkout 1회 발사.
  // items 배열 변동으로 재발사되지 않도록 hydrated만 의존.
  useEffect(() => {
    if (!hydrated || items.length === 0) return;
    trackBeginCheckout(
      items.map((i) => ({
        item_id: i.productId,
        item_name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      subtotal,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="container-page py-16">
        <div className="h-6 w-32 rounded bg-secondary animate-pulse" />
      </div>
    );
  }

  if (items.length === 0) {
    return null; // 리다이렉트 중 빈 렌더
  }

  const orderName =
    items.length === 1
      ? items[0].name
      : `${items[0].name} 외 ${items.length - 1}건`;
  const firstItem = items[0];
  const ready = isFormReady(address);

  return (
    <>
      <header className="container-page pt-12 pb-6">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <Link href="/cart" className="hover:text-ink">
            장바구니
          </Link>
          <span className="mx-2">›</span>
          <span>결제</span>
        </nav>
        <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
          <h1>결제</h1>
          <Link
            href="/cart"
            className="text-small text-mute-1 hover:text-ink"
          >
            ← 장바구니로 돌아가기
          </Link>
        </div>
        <p className="mt-2 text-xs text-mute-2">
          1. 장바구니 → 2. 배송지 → <span className="font-semibold text-ink">3. 결제</span>
        </p>
      </header>

      <section className="container-page pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
          <div className="space-y-6">
            <AddressForm value={address} onChange={setAddress} />
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <OrderReview />
            <TossWidget
              amount={subtotal}
              ready={ready}
              orderInfo={{
                orderId,
                orderName,
                customerName: address.name || "구매자",
                customerEmail: address.email || undefined,
                customerMobilePhone:
                  address.phone.replace(/-/g, "") || undefined,
                productId: firstItem.productId,
                variantId: firstItem.variantId ?? null,
                quantity: firstItem.quantity,
                ship: {
                  zipcode: address.zipcode,
                  address1: address.address1,
                  address2: address.address2,
                  memo: address.memo || undefined,
                },
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
