import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { parseVariants } from "@/lib/products/format";
import { Gallery } from "@/components/pdp/Gallery";
import { ProductSummary } from "@/components/pdp/ProductSummary";
import { OptionPicker } from "@/components/pdp/OptionPicker";
import { SpecTable } from "@/components/pdp/SpecTable";
import { Layer4Section } from "@/components/pdp/Layer4Section";
import { ReviewsSection } from "@/components/pdp/ReviewsSection";
import { FaqSection } from "@/components/pdp/FaqSection";
import { StickyBuyBar } from "@/components/pdp/StickyBuyBar";
import { ViewItemTracker } from "@/components/pdp/ViewItemTracker";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type FaqRow = Database["public"]["Tables"]["faqs"]["Row"];

// Stage 18 — 마스터 1개 + 4 legacy SKU id (redirect용).
const MASTER_ID = "purrpik-shelter";
const LEGACY_IDS = ["basic-m", "basic-l", "allinone-m", "allinone-l"] as const;
const VALID_MASTER_IDS = [MASTER_ID] as const;

// force-dynamic: cookies() 사용한 createClient 때문에 prerender 시 fail → notFound 캐시되는 문제 회피.
export const dynamic = "force-dynamic";

async function fetchMasterProduct(id: string): Promise<ProductRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .eq("is_master", true)
      .limit(1);
    if (error) {
      console.error(
        `[/shop/${id}] product fetch error:`,
        error.message,
        error.code,
        error.details,
      );
      return null;
    }
    if (!data || data.length === 0) {
      console.error(
        `[/shop/${id}] master product not found in DB (rows=${data?.length ?? 0})`,
      );
      return null;
    }
    return data[0];
  } catch (e) {
    console.error(`[/shop/${id}] supabase unavailable:`, (e as Error).message);
    return null;
  }
}

async function fetchReviews(productId: string): Promise<ReviewRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("display_order", { ascending: false })
      .limit(6);
    if (error) {
      console.warn(`[/shop/${productId}] reviews fetch error:`, error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn(
      `[/shop/${productId}] reviews supabase unavailable:`,
      (e as Error).message,
    );
    return [];
  }
}

async function fetchProductFaqs(): Promise<FaqRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("category", "제품")
      .eq("active", true)
      .order("display_order", { ascending: true });
    if (error) {
      console.warn("[/shop/[id]] faqs fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn(
      "[/shop/[id]] faqs supabase unavailable:",
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
  const product = await fetchMasterProduct(effectiveId);
  if (!product) {
    return { title: "상품을 찾을 수 없습니다 — 푸르픽" };
  }
  const plain =
    product.description_html?.replace(/<[^>]+>/g, "").trim().slice(0, 120) ??
    "푸르픽 길고양이 보호 셸터 — 4중 구조.";
  return {
    title: `${product.name} — 푸르픽`,
    description: plain,
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

  if (!VALID_MASTER_IDS.includes(id as (typeof VALID_MASTER_IDS)[number])) {
    notFound();
  }

  const [product, reviews, faqs] = await Promise.all([
    fetchMasterProduct(id),
    fetchReviews(id),
    fetchProductFaqs(),
  ]);

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
      seller: { "@type": "Organization", name: "신성컴퍼니" },
    },
  };
  if (reviews.length > 0) {
    const avg =
      reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;
    productLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
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

      <SpecTable product={product} variants={variants} />
      <Layer4Section />
      <ReviewsSection productId={product.id} reviews={reviews} />
      <FaqSection faqs={faqs} />

      <StickyBuyBar product={product} />
    </>
  );
}
