import Link from "next/link";

/**
 * Stories — Stage 19: 큐레이션 카드 섹션 (29CM 셀렉트샵 톤).
 *
 * 시즌 가이드 + 자재 스토리 + 캠페인 3 카드.
 * 이미지 placeholder (P2 — Supabase storage / public/ 자산 정식 업로드).
 * 이모지 금지 (전역 룰).
 */
type Story = {
  badge: string;
  title: string;
  desc: string;
  href: string;
  /** placeholder bg — gradient (assets 미배치 단계). P2에서 실제 이미지로 교체. */
  bg: string;
};

const STORIES: Story[] = [
  {
    badge: "시즌 가이드",
    title: "장마철 길냥이 보호 5가지 팁",
    desc: "비·습기·곰팡이 막는 셸터 운용 노하우.",
    href: "/care-guide#summer",
    bg: "from-zinc-200 to-zinc-300",
  },
  {
    badge: "자재 이야기",
    title: "Oxford 600D부터 TPU까지, 4중 구조의 비밀",
    desc: "각 레이어가 어떤 역할을 하는지 살펴보세요.",
    href: "/about#layers",
    bg: "from-brand-mustard/30 to-brand-mustard/10",
  },
  {
    badge: "GIVE BACK",
    title: "매 판매 1건 = 1,000원 기금 적립",
    desc: "캣맘·동물보호단체 지원에 함께해주세요.",
    href: "/give-back",
    bg: "from-ink/20 to-ink/5",
  },
];

export function Stories() {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mb-10 max-w-2xl">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          STORIES
        </p>
        <h2 className="mt-3">푸르픽 이야기</h2>
        <p className="mt-3 text-mute-1">
          길냥이 보호의 시작, 푸르픽의 시즌 큐레이션.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {STORIES.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-md"
          >
            <div
              className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${s.bg}`}
              aria-hidden="true"
            />
            <div className="flex flex-1 flex-col p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-brand-mustard">
                {s.badge}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-ink leading-snug">
                {s.title}
              </h3>
              <p className="mt-2 text-small text-mute-1 leading-relaxed">
                {s.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-small font-medium text-ink group-hover:text-brand-mustard">
                자세히 보기 →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
