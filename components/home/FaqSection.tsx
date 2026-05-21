import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

async function fetchFaqs(): Promise<FaqRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true })
      .limit(5);
    if (error) {
      console.warn("[FaqSection] faqs fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[FaqSection] supabase unavailable:", (e as Error).message);
    return [];
  }
}

export async function FaqSection() {
  const faqs = await fetchFaqs();

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-8 max-w-3xl">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          FAQ
        </p>
        <h2 className="mt-3">자주 묻는 질문</h2>
      </div>

      {faqs.length === 0 ? (
        <p className="text-mute-2 text-small">FAQ 데이터 연결 대기 중.</p>
      ) : (
        <Accordion type="single" collapsible className="border-t border-line">
          {faqs.map((f) => (
            <AccordionItem key={f.id} value={f.id} className="border-b border-line">
              <AccordionTrigger className="py-5 text-base font-semibold">
                {f.question}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="text-small text-mute-1 leading-relaxed"
                  // answer_html은 자체 마이그레이션에서 작성한 신뢰 가능한 HTML.
                  // 외부 입력이 아니므로 dangerouslySetInnerHTML 사용.
                  dangerouslySetInnerHTML={{ __html: f.answer_html }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="mt-8">
        <Link
          href="/faq"
          className="text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep"
        >
          FAQ 전체 보기 →
        </Link>
      </div>
    </section>
  );
}
