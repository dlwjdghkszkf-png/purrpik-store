import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { FaqClient } from "./FaqClient";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

export const metadata: Metadata = {
  title: "FAQ — 푸르픽",
  description: "푸르픽 자주 묻는 질문 — 제품·배송·환불·돌봄.",
};

// 24h ISR.
export const revalidate = 86400;

async function fetchFaqs(): Promise<FaqRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });
    if (error) {
      console.warn("[/faq] faqs fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[/faq] supabase unavailable:", (e as Error).message);
    return [];
  }
}

export default async function FaqPage() {
  const faqs = await fetchFaqs();

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
