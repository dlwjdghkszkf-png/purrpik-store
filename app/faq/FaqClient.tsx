"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Database } from "@/lib/supabase/types";

type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];
type Category = "전체" | "제품" | "배송" | "환불" | "돌봄";

const CATEGORIES: { key: Category; anchor: string }[] = [
  { key: "전체", anchor: "all" },
  { key: "제품", anchor: "product" },
  { key: "배송", anchor: "shipping" },
  { key: "환불", anchor: "refund" },
  { key: "돌봄", anchor: "care" },
];

export function FaqClient({ faqs }: { faqs: FaqRow[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Category>("전체");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter((f) => {
      if (active !== "전체" && f.category !== active) return false;
      if (!q) return true;
      return (
        f.question.toLowerCase().includes(q) ||
        f.answer_html.toLowerCase().includes(q)
      );
    });
  }, [faqs, query, active]);

  // 카테고리별 그룹 (active === '전체' 일 때만)
  const groups = useMemo(() => {
    if (active !== "전체") {
      return [{ key: active, items: filtered }] as {
        key: Category;
        items: FaqRow[];
      }[];
    }
    return CATEGORIES.slice(1).map((c) => ({
      key: c.key,
      items: filtered.filter((f) => f.category === c.key),
    }));
  }, [filtered, active]);

  return (
    <>
      <div className="container-page sticky top-0 z-10 bg-bg pb-3 pt-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isActive = active === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setActive(c.key)}
                  className={
                    "rounded-full px-4 py-1.5 text-small font-medium transition " +
                    (isActive
                      ? "bg-ink text-white"
                      : "bg-zinc-100 text-mute-1 hover:bg-zinc-200")
                  }
                >
                  {c.key}
                </button>
              );
            })}
          </div>
          <div className="w-full md:w-72">
            <Input
              type="search"
              placeholder="검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="FAQ 검색"
            />
          </div>
        </div>
      </div>

      <section className="container-page pb-20">
        {faqs.length === 0 ? (
          <p className="py-12 text-center text-small text-mute-2">
            FAQ 데이터 연결 대기 중.
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-small text-mute-2">
            검색 결과가 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {groups.map((g) => {
              if (g.items.length === 0) return null;
              const anchor =
                CATEGORIES.find((c) => c.key === g.key)?.anchor ?? "all";
              return (
                <div key={g.key} id={anchor} className="scroll-mt-24">
                  <h2 className="mb-4 text-xl font-semibold">{g.key}</h2>
                  <Accordion
                    type="single"
                    collapsible
                    className="border-t border-line"
                  >
                    {g.items.map((f) => (
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
                            dangerouslySetInnerHTML={{ __html: f.answer_html }}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
