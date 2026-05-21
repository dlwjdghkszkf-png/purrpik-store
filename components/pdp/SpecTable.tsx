import type { Database } from "@/lib/supabase/types";
import { summarizeIncludes } from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * SpecTable — 제품 스펙 표 (RSC).
 *
 * 4중 구조 자재명/수치 그대로 유지 (스펙 용어 보존).
 * native table + 디자인 토큰. shadcn Table 미도입 — 단일 표라 최소화.
 */
export function SpecTable({ product }: { product: ProductRow }) {
  const rows: { label: string; value: string }[] = [
    {
      label: "외부 사이즈",
      value: product.size_outer ?? "—",
    },
    {
      label: "입구 사이즈",
      value: product.size_entry ?? "—",
    },
    {
      label: "구조",
      value: "4중 구조 — Oxford 600D · AL Foil · EPE Foam · TPU",
    },
    {
      label: "방수",
      value: "내수압 3,000mm 이상 (자체 시험)",
    },
    {
      label: "하중",
      value: "수직 70kg 하중 변형 0mm (자체 시험)",
    },
    {
      label: "자외선",
      value: "AL Foil 층 99% 차단",
    },
    {
      label: "구성품",
      value: summarizeIncludes(product.includes),
    },
  ];

  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-6 max-w-3xl">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          SPEC
        </p>
        <h2 className="mt-3">스펙</h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left">
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.label} className="bg-white">
                <th
                  scope="row"
                  className="w-1/3 max-w-[200px] bg-zinc-50 px-5 py-4 align-top text-small font-medium text-ink"
                >
                  {r.label}
                </th>
                <td className="px-5 py-4 text-small text-mute-1">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
