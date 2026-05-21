import Link from "next/link";

/**
 * GiveBack — 길냥이 보호 메시지 + 매 판매당 1,000원 적립 안내.
 * 톤: 미니멀, 약속 명시 + 정식 캠페인은 P2 예고.
 */
export function GiveBack() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-page">
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-line bg-zinc-50 md:grid-cols-2">
          {/* 좌측: 이미지 placeholder (실외 골목 길냥이 톤) */}
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px]">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 via-zinc-400 to-zinc-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* 우측: 카피 */}
          <div className="flex flex-col justify-center p-8 md:p-12">
            <p className="text-small font-medium uppercase tracking-[0.25em] text-brand-mustard">
              GIVE BACK
            </p>
            <h2 className="mt-3">골목의 그 아이를 위해</h2>
            <p className="mt-5 text-mute-1 leading-relaxed">
              푸르픽은 매 판매 1건당 길냥이 보호 기금 1,000원을 적립합니다.
              <br className="hidden md:inline" />
              (P2 정식 캠페인 예정)
            </p>
            <div className="mt-8">
              <Link
                href="/give-back"
                className="inline-flex h-11 items-center justify-center rounded-md border border-ink bg-transparent px-5 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-white"
              >
                자세히 보기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
