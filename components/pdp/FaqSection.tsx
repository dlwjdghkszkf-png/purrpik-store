import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Database } from "@/lib/supabase/types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

/**
 * FaqSection (PDP) — props로 받은 faqs를 그대로 렌더 (RSC).
 *
 * 홈 FaqSection과 차이: 카테고리 필터 없이 받은 props를 그대로 표시.
 * answer_html은 자체 마이그레이션 데이터 → dangerouslySetInnerHTML 안전.
 */
export function FaqSection({ faqs }: { faqs: FaqRow[] }) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          FAQ
        </p>
        <h2 className="mt-3">제품 FAQ</h2>
      </div>

      {faqs.length === 0 ? (
        <p className="text-small text-mute-2">
          제품 FAQ 데이터 연결 대기 중.
        </p>
      ) : (
        <Accordion type="single" collapsible className="border-t border-line">
          {faqs.map((f) => (
            <AccordionItem
              key={f.id}
              value={f.id}
              className="border-b border-line"
            >
              <AccordionTrigger className="py-5 text-base font-semibold">
                {f.question}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="text-small text-mute-1 leading-relaxed"
                  // answer_html은 자체 마이그레이션 데이터.
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
