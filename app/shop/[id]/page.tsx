import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Database } from "@/lib/supabase/types";
import { parseVariants } from "@/lib/products/format";
import { Gallery } from "@/components/pdp/Gallery";
import { ProductSummary } from "@/components/pdp/ProductSummary";
import { OptionPicker } from "@/components/pdp/OptionPicker";
import { SpecTable } from "@/components/pdp/SpecTable";
import { Layer4Section } from "@/components/pdp/Layer4Section";
import { ProductDetailImages } from "@/components/pdp/ProductDetailImages";
import { getProductDetail } from "@/lib/product-detail";
import {
  getMasterProductById,
  getReviews,
  getFaqs,
} from "@/lib/products/catalog";
import { ReviewsSection } from "@/components/pdp/ReviewsSection";
import { ReviewsHero } from "@/components/pdp/ReviewsHero";
import { FaqSection } from "@/components/pdp/FaqSection";
import { StickyBuyBar } from "@/components/pdp/StickyBuyBar";
import { ViewItemTracker } from "@/components/pdp/ViewItemTracker";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

// Stage 18 — 마스터 1개 + 4 legacy SKU id (redirect용).
// P2-4: 유효 상품 판단은 DB 조회 결과로 한다 — 여기 하드코딩 목록에 없으면
//       새 상품을 DB에 추가해도 404가 되던 문제. legacy redirect 목록만 코드 유지.
const MASTER_ID = "purrpik-shelter";
const LEGACY_IDS = ["basic-m", "basic-l", "allinone-m", "allinone-l"] as const;

// force-dynamic: cookies() 사용한 createClient 때문에 prerender 시 fail → notFound 캐시되는 문제 회피.
export const dynamic = "force-dynamic";

// P1-2: 캐시된 cookie-less 로더 사용.
// - 성공 + 미존재 → null (호출부 notFound)
// - 조회 실패 → throw (error.tsx 경계로, 404 위장 금지)
// generateMetadata에서만 실패를 삼켜 메타 fallback 처리한다.
function fetchMasterProduct(id: string): Promise<ProductRow | null> {
  return getMasterProductById(id);
}

async function fetchReviews(
  productId: string,
): Promise<{ reviews: ReviewRow[]; total: number }> {
  // P2-2: 캐시 + 재시도 로더. 전체를 받아 total 산정 후 상위 14개 표시.
  const all = await getReviews(productId);
  return { reviews: all.slice(0, 14), total: all.length };
}

async function fetchProductFaqs(): Promise<FaqRow[]> {
  try {
    return await getFaqs("제품");
  } catch (e) {
    console.warn(
      "[/shop/[id]] faqs unavailable:",
      (e as Error).message,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // Legacy id면 마스터 메타로 fallback (redirect 전 generateMetadata도 실행됨).
  const effectiveId = LEGACY_IDS.includes(id as (typeof LEGACY_IDS)[number])
    ? MASTER_ID
    : id;
  // 메타 생성 실패는 페이지를 죽이지 않는다 — 조회 실패는 page 본문에서 throw되어
  // error.tsx가 처리하고, 여기선 fallback 타이틀만.
  let product: ProductRow | null = null;
  try {
    product = await fetchMasterProduct(effectiveId);
  } catch {
    return { title: "푸르픽" };
  }
  if (!product) {
    return { title: "상품을 찾을 수 없습니다" };
  }
  const plain =
    product.description_html?.replace(/<[^>]+>/g, "").trim().slice(0, 120) ??
    "푸르픽 길고양이 보호 셸터 — 4중 구조.";
  return {
    title: product.name,
    description: plain,
    // 레거시 id 크롤에도 마스터 URL이 정본임을 명시 (리다이렉트와 이중 신호).
    alternates: { canonical: `/shop/${effectiveId}` },
    openGraph: {
      title: product.name,
      description: plain,
      type: "website",
      locale: "ko_KR",
      images: product.hero_image ? [product.hero_image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sku?: string }>;
}) {
  const { id } = await params;
  const { sku: skuFromQuery } = await searchParams;

  // Stage 18 — Legacy SKU id면 마스터로 redirect (SEO 보존).
  if (LEGACY_IDS.includes(id as (typeof LEGACY_IDS)[number])) {
    redirect(`/shop/${MASTER_ID}?sku=${id}`);
  }

  const [product, reviewsData, faqs] = await Promise.all([
    fetchMasterProduct(id),
    fetchReviews(id),
    fetchProductFaqs(),
  ]);
  const { reviews, total: reviewTotal } = reviewsData;

  // 조회 성공 + 미존재(active master 아님)만 404. 조회 실패는 fetchMasterProduct가 throw.
  if (!product) {
    notFound();
  }

  const variants = parseVariants(product.variants);
  // 마스터에 variants 없으면 페이지 의미 X — 데이터 누락 시 404.
  if (!variants) {
    console.error(`[/shop/${id}] master product has no variants — abort`);
    notFound();
  }

  // JSON-LD: master Product + AggregateOffer (price_min ~ price_max)
  const priceMin = product.price_min ?? product.price;
  const priceMax = product.price_max ?? product.price;
  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.id,
    description: product.description_html?.replace(/<[^>]+>/g, "").trim(),
    image: product.hero_image ? [product.hero_image] : undefined,
    brand: { "@type": "Brand", name: "푸르픽" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "KRW",
      lowPrice: priceMin,
      highPrice: priceMax,
      offerCount: variants.skus.length,
      availability: "https://schema.org/InStock",
      url: `https://purrpik.com/shop/${product.id}`,
      seller: { "@type": "Organization", name: "제이에이치컴퍼니" },
    },
  };
  if (reviews.length > 0) {
    const avg =
      reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;
    productLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: reviewTotal,
    };
  }

  // 초기 선택 SKU 결정.
  const initialSku =
    (skuFromQuery && variants.skus.find((s) => s.id === skuFromQuery)?.id) ||
    variants.skus[0]?.id ||
    "";

  return (
    <>
      <script
        type="application/ld+json"
        // 자체 데이터 직렬화 — 외부 입력 아님.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <ViewItemTracker
        product={{ id: product.id, name: product.name, price: priceMin }}
      />

      <div className="container-page pt-6 pb-24 lg:pb-16">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <Link href="/shop" className="hover:text-ink">
            전체 상품
          </Link>
          <span className="mx-2">›</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <ReviewsHero
          productId={product.id}
          reviews={reviews}
          totalCount={reviewTotal}
        />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <Gallery product={product} />
          <div>
            <ProductSummary product={product} />
            <OptionPicker
              product={product}
              variants={variants}
              initialSku={initialSku}
            />
          </div>
        </div>
      </div>

      <ProductDetailImages productId={product.id} />
      <SpecTable product={product} variants={variants} />
      {/* 상세 이미지가 있는 상품은 일반 마케팅 섹션(Layer4) 생략 — 슬라이스가 대체 */}
      {!getProductDetail(product.id) && <Layer4Section />}
      <ReviewsSection
        productId={product.id}
        reviews={reviews}
        totalCount={reviewTotal}
      />
      <FaqSection faqs={faqs} />

      <StickyBuyBar product={product} initialSku={initialSku} />
    </>
  );
}
