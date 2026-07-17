import Image from "next/image";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type IgRow = Database["public"]["Tables"]["instagram_posts"]["Row"];

/**
 * DB 미연결 폴백 — 실제 사용 사진(실구매 리뷰 자산)으로 렌더.
 * 회색 placeholder 대신 진짜 설치·사용 컷을 노출해 "실제 사용 모습"을 증명.
 * 실 게시물(instagram_posts)이 채워지면 그쪽이 우선.
 */
const FALLBACK_CELLS: { img: string; caption: string }[] = [
  { img: "/images/reviews/shelter-r03.jpg", caption: "길냥이가 바로 들어간 날" },
  { img: "/images/reviews/shelter-r06.jpg", caption: "장마철 야외 설치 현장" },
  { img: "/images/reviews/coolmat-r01.jpg", caption: "쿨매트 위 늘어진 오후" },
  { img: "/images/reviews/shelter-r08.jpg", caption: "한겨울에도 따뜻한 안쪽" },
  { img: "/images/reviews/shelter-r09.jpg", caption: "60초 설치 챌린지" },
  { img: "/images/reviews/coolmat-r03.jpg", caption: "노령묘도 편한 쿨매트" },
  { img: "/images/reviews/shelter-r02.jpg", caption: "골목 지킴이 블랙 셸터" },
  { img: "/images/reviews/shelter-r05.jpg", caption: "70kg 하중 시험 통과" },
  { img: "/images/reviews/coolmat-r06.jpg", caption: "두 냥이 나란히 쿨매트" },
  { img: "/images/reviews/shelter-r10.jpg", caption: "택배박스 같은 깔끔한 외관" },
  { img: "/images/reviews/coolmat-r10.jpg", caption: "한여름 필수 쿨링" },
  { img: "/images/reviews/shelter-r04.jpg", caption: "바닥 습기 차단 팔렛트" },
];

async function fetchIgPosts(): Promise<IgRow[]> {
  try {
    const supabase = await createClient();
    // active 필터 없이 12개 모두 노출 (시드는 placeholder, 실제 게시물 도착 시 active=true 처리)
    const { data, error } = await supabase
      .from("instagram_posts")
      .select("*")
      .order("display_order", { ascending: true })
      .limit(12);
    if (error) {
      console.warn("[InstagramFeed] ig fetch error:", error.message);
      return [];
    }
    return data ?? [];
  } catch (e) {
    console.warn("[InstagramFeed] supabase unavailable:", (e as Error).message);
    return [];
  }
}

export async function InstagramFeed() {
  const posts = await fetchIgPosts();

  // DB 미연결 폴백: 실제 사용 사진 12컷 렌더 (회색 placeholder 대체)
  const renderCells =
    posts.length > 0
      ? posts.map((p) => ({
          key: p.id,
          caption: p.caption ?? "푸르픽",
          href: p.permalink,
          img: p.thumbnail_url ?? null,
        }))
      : FALLBACK_CELLS.map((c, i) => ({
          key: `ph-${i}`,
          caption: c.caption,
          href: "https://instagram.com/purrpik",
          img: c.img,
        }));

  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
            INSTAGRAM
          </p>
          <h2 className="mt-3 text-brand-mustard">@purrpik</h2>
          <p className="mt-3 text-small text-mute-1">
            실제 사용 모습 · 최신 게시물
          </p>
        </div>
        <a
          href="https://instagram.com/purrpik"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start text-small font-medium text-brand-mustard underline underline-offset-4 hover:text-brand-mustard-deep"
        >
          <Camera className="size-4" aria-hidden="true" />
          Instagram 팔로우 →
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {renderCells.map(({ key, caption, href, img }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden rounded-md bg-zinc-200"
            aria-label={`Instagram 게시물: ${caption}`}
          >
            {img ? (
              <Image
                src={img}
                alt={caption}
                fill
                sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
            )}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="line-clamp-2 text-[11px] font-medium text-white leading-tight">
                {caption}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
