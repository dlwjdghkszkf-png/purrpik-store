import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { ProductCard } from "@/components/shop/ProductCard";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * EditionGrid — 4 에디션 카드 (BASIC M/L + ALL-IN-ONE M/L).
 *
 * 데이터: Supabase products WHERE active ORDER BY display_order.
 * env 미설정·DB 미연결 환경에서도 안전하도록 try/catch + 빈 배열 폴백.
 *
 * 카드 시각/구조는 <ProductCard> (shop과 공용)에 위임.
 */
async function fetchProducts(): Promise<ProductRow[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("display_order", { ascending: true });
    if (error) {
      console.warn("[EditionGrid] products fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[EditionGrid] supabase unavailable:", (e as Error).message);
    return [];
  }
}

export async function EditionGrid() {
  const products = await fetchProducts();

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2>에디션 4종 — 사이즈와 구성 한눈에</h2>
          <p className="mt-3 text-mute-1">
            BASIC은 본체 + 담요, ALL-IN-ONE은 쿨매트·깔판·밥그릇까지 한 번에.
          </p>
        </div>
        <span className="inline-flex items-center self-start rounded-full bg-brand-mustard/10 px-3 py-1 text-small font-medium text-brand-mustard">
          ALL-IN-ONE L · 실구매자 다수 선택
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.length === 0
          ? // DB 미연결 폴백: 4 placeholder 카드 (구조 확인용)
            Array.from({ length: 4 }).map((_, i) => (
              <article
                key={`ph-${i}`}
                className="overflow-hidden rounded-lg border border-line bg-white"
              >
                <div className="aspect-square w-full bg-zinc-100" />
                <div className="p-5">
                  <p className="text-small font-medium uppercase tracking-wider text-brand-mustard">
                    {i < 2 ? "BASIC" : "ALL-IN-ONE"}
                  </p>
                  <h3 className="mt-1 text-h3 font-semibold">
                    {i % 2 === 0 ? "M" : "L"}
                  </h3>
                  <p className="mt-2 text-mute-1">데이터 연결 대기 중</p>
                </div>
              </article>
            ))
          : products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
