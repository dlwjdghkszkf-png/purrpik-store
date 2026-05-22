import type { Database, ProductVariants } from "@/lib/supabase/types";
import { editionLabel, formatPrice, summarizeIncludes } from "@/lib/products/format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

interface Props {
  product: ProductRow;
  /** Stage 18 — variants가 있으면 4 SKU 비교표 모드. 없으면 단일 표. */
  variants?: ProductVariants | null;
}

/**
 * SpecTable — 제품 스펙 표 (RSC).
 *
 * Stage 18: variants 있으면 4 SKU 비교표 (Wild One/Tuft+Paw 패턴, 구매 결정 도움).
 * 없으면 기존 단일 표.
 * 공통 스펙(4중 구조·방수·하중·자외선)은 표 아래 별도 블록으로.
 */
export function SpecTable({ product, variants }: Props) {
  if (variants && variants.skus.length > 0) {
    return <VariantsComparisonTable product={product} variants={variants} />;
  }

  return <SingleProductTable product={product} />;
}

function VariantsComparisonTable({
  product,
  variants,
}: {
  product: ProductRow;
  variants: ProductVariants;
}) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mb-6 max-w-3xl">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          SPEC
        </p>
        <h2 className="mt-3">옵션 비교 · 스펙</h2>
        <p className="mt-2 text-small text-mute-1">
          {product.name} — 4 옵션 한눈 비교.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] text-left text-small">
          <thead className="bg-zinc-50">
            <tr>
              <th className="w-[120px] px-4 py-3 text-mute-1">항목</th>
              {variants.skus.map((sku) => (
                <th key={sku.id} className="px-4 py-3 text-ink">
                  <div className="font-semibold uppercase tracking-wider text-brand-mustard">
                    {editionLabel(sku.edition)}
                  </div>
                  <div className="text-base font-bold">{sku.size}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr className="bg-white">
              <th
                scope="row"
                className="bg-zinc-50/40 px-4 py-3 align-top font-medium text-mute-1"
              >
                가격
              </th>
              {variants.skus.map((sku) => (
                <td
                  key={sku.id}
                  className="px-4 py-3 align-top tabular-nums font-semibold text-ink"
                >
                  {formatPrice(sku.price)}
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              <th
                scope="row"
                className="bg-zinc-50/40 px-4 py-3 align-top font-medium text-mute-1"
              >
                외부 사이즈
              </th>
              {variants.skus.map((sku) => (
                <td key={sku.id} className="px-4 py-3 align-top text-mute-1">
                  {sku.size_outer}
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              <th
                scope="row"
                className="bg-zinc-50/40 px-4 py-3 align-top font-medium text-mute-1"
              >
                입구 사이즈
              </th>
              {variants.skus.map((sku) => (
                <td key={sku.id} className="px-4 py-3 align-top text-mute-1">
                  {sku.size_entry}
                </td>
              ))}
            </tr>
            <tr className="bg-white">
              <th
                scope="row"
                className="bg-zinc-50/40 px-4 py-3 align-top font-medium text-mute-1"
              >
                구성품
              </th>
              {variants.skus.map((sku) => (
                <td key={sku.id} className="px-4 py-3 align-top text-mute-1">
                  {sku.includes.join(" + ")}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 공통 스펙 — 4 SKU 동일 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CommonSpec
          label="구조"
          value="4중 구조 — Oxford 600D · AL Foil · EPE Foam · TPU"
        />
        <CommonSpec
          label="방수"
          value="내수압 3,000mm 이상 (자체 시험)"
        />
        <CommonSpec
          label="하중"
          value="수직 70kg 하중 변형 0mm (자체 시험)"
        />
        <CommonSpec label="자외선" value="AL Foil 층 99% 차단" />
      </div>
    </section>
  );
}

function CommonSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-white p-4">
      <p className="text-[11px] uppercase tracking-wider text-mute-2">{label}</p>
      <p className="mt-1 text-small text-mute-1">{value}</p>
    </div>
  );
}

function SingleProductTable({ product }: { product: ProductRow }) {
  const rows: { label: string; value: string }[] = [
    { label: "외부 사이즈", value: product.size_outer ?? "—" },
    { label: "입구 사이즈", value: product.size_entry ?? "—" },
    {
      label: "구조",
      value: "4중 구조 — Oxford 600D · AL Foil · EPE Foam · TPU",
    },
    { label: "방수", value: "내수압 3,000mm 이상 (자체 시험)" },
    { label: "하중", value: "수직 70kg 하중 변형 0mm (자체 시험)" },
    { label: "자외선", value: "AL Foil 층 99% 차단" },
    { label: "구성품", value: summarizeIncludes(product.includes) },
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
