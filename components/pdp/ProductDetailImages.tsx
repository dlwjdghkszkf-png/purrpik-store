/* eslint-disable @next/next/no-img-element */
import { getProductDetail } from "@/lib/product-detail";

/**
 * 상품 상세정보 — 마켓 상세 슬라이스를 자사몰 PDP 본문으로 렌더.
 * 슬라이스는 780px 모바일 포맷 → 중앙 정렬 max-w-2xl로 데스크톱서도 읽기 좋게.
 */
export function ProductDetailImages({ productId }: { productId: string }) {
  const detail = getProductDetail(productId);
  if (!detail) return null;

  return (
    <section
      aria-label="상품 상세정보"
      className="mt-16 border-t border-line pt-12"
    >
      <h2 className="mb-8 text-center text-2xl font-bold">상품 상세정보</h2>
      <div className="mx-auto max-w-2xl">
        {detail.hooks.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            className="block w-full"
            loading="lazy"
          />
        ))}
        {detail.slices.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`상품 상세 ${i + 1}`}
            className="block w-full"
            loading="lazy"
          />
        ))}
      </div>
    </section>
  );
}
