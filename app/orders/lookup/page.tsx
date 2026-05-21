import type { Metadata } from "next";
import Link from "next/link";
import { LookupClient } from "./LookupClient";

export const metadata: Metadata = {
  title: "주문 조회 — 푸르픽",
  description: "비회원 주문 조회. 주문번호·이메일·휴대폰 끝 4자리로 조회합니다.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function OrderLookupPage() {
  return (
    <>
      <header className="container-page pt-12 pb-8">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <span>주문 조회</span>
        </nav>
        <h1 className="mt-3">주문 조회</h1>
        <p className="mt-3 text-mute-1">
          비회원 주문은 결제 시 입력한 정보로 조회할 수 있습니다.
        </p>
      </header>

      <div className="container-page max-w-xl pb-20">
        <LookupClient />
      </div>
    </>
  );
}
