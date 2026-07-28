import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFaqs } from "@/lib/products/catalog";

export async function FaqSection() {
  // P2-2: 캐시 + 재시도 로더. 홈은 상위 5개만 노출.
  const faqs = (await getFaqs()).slice(0, 5);

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
