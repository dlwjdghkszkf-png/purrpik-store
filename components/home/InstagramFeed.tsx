import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type IgRow = Database["public"]["Tables"]["instagram_posts"]["Row"];

const PLACEHOLDER_CAPTIONS = [
  "장마 전 길냥이집 설치 현장",
  "4중 구조 단면 컷",
  "팔렛트 깔판 + TPU 바닥 방수",
  "70kg 하중 시험 비하인드",
  "입구 사이즈 비교 — M vs L",
  "쿨매트 표면 온도 측정",
  "실구매자 후기 #리그램",
  "60초 설치 챌린지",
  "아파트 단지 설치 가이드",
  "담요 4색 랜덤",
  "장마 D-30 도착 보장",
  "길냥이집 사진 콘테스트",
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

  // DB 미연결 폴백: 컴포넌트 안에서 12 placeholder 카드 렌더 (구조 확인용)
  const renderCells =
    posts.length > 0
      ? posts.map((p) => ({
          key: p.id,
          caption: p.caption ?? "푸르픽",
          href: p.permalink,
        }))
      : PLACEHOLDER_CAPTIONS.map((c, i) => ({
          key: `ph-${i}`,
          caption: c,
          href: "https://instagram.com/purrpik",
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
        {renderCells.map(({ key, caption, href }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block aspect-square overflow-hidden rounded-md bg-zinc-200"
            aria-label={`Instagram 게시물: ${caption}`}
          >
            {/* TODO: <Image> 실제 thumbnail_url 연결 (Stage 14) */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300" />
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
