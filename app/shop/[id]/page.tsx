import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
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

const VALID_IDS = ["basic-m", "basic-l", "allinone-m", "allinone-l"] as const;

// 24h ISR + SSG (4 페이지 사전 렌더). dynamicParams=true: 빌드시 fetch 실패해도 request 시점 재시도.
export const revalidate = 86400;
export const dynamicParams = true;

export function generateStaticParams() {
  return VALID_IDS.map((id) => ({ id }));
}

async function fetchProduct(id: string): Promise<ProductRow | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();
    if (error) {
      console.warn(`[/shop/${id}] product fetch error:`, error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn(`[/shop/${id}] supabase unavailable:`, (e as Error).message);
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
  const product = await fetchProduct(id);
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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!VALID_IDS.includes(id as (typeof VALID_IDS)[number])) {
    notFound();
  }

  const [product, reviews, faqs] = await Promise.all([
    fetchProduct(id),
    fetchReviews(id),
    fetchProductFaqs(),
  ]);

  if (!product) {
    notFound();
  }

  // JSON-LD: Product + Offer + (선택) AggregateRating
  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.id,
    description: product.description_html?.replace(/<[^>]+>/g, "").trim(),
    image: product.hero_image ? [product.hero_image] : undefined,
    brand: { "@type": "Brand", name: "푸르픽" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "KRW",
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

  return (
    <>
      <script
        type="application/ld+json"
        // 자체 데이터 직렬화 — 외부 입력 아님.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <ViewItemTracker
        product={{ id: product.id, name: product.name, price: product.price }}
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
            <OptionPicker product={product} />
          </div>
        </div>
      </div>

      <SpecTable product={product} />
      <Layer4Section />
      <ReviewsSection productId={product.id} reviews={reviews} />
      <FaqSection faqs={faqs} />

      <StickyBuyBar product={product} />
    </>
  );
}
