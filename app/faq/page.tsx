import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs } from "@/lib/products/catalog";
import { FaqClient } from "./FaqClient";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "FAQ",
  description: "푸르픽 자주 묻는 질문 — 제품·배송·환불·돌봄.",
};

// 24h ISR.
export const revalidate = 86400;

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <>
      <header className="container-page pt-12 pb-6">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <span>FAQ</span>
        </nav>
        <h1 className="mt-3">자주 묻는 질문</h1>
        <p className="mt-3 text-mute-1">
          제품·배송·환불·돌봄까지 — 가장 많이 받는 질문을 모았습니다.
        </p>
      </header>

      <FaqClient faqs={faqs} />
    </>
  );
}
