import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Stethoscope, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Give Back — 푸르픽",
  description: "푸르픽은 길냥이를 위한 브랜드입니다. 매 판매의 일부를 길냥이 보호 기금으로 적립합니다.",
};

export const revalidate = 86400;

const USES = [
  {
    Icon: Cookie,
    title: "사료 지원",
    desc: "캣맘·캣대디 네트워크에 정기 사료 후원.",
  },
  {
    Icon: Stethoscope,
    title: "TNR · 진료",
    desc: "중성화·구조·치료비 매칭 지원.",
  },
  {
    Icon: Heart,
    title: "임시보호 단체",
    desc: "지역 동물보호 단체에 운영 후원.",
  },
];

export default function GiveBackPage() {
  return (
    <>
      {/* Hero */}
      <header className="container-page pt-16 pb-12 md:pt-24 md:pb-20">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          GIVE BACK
        </p>
        <h1 className="mt-4 text-5xl font-bold leading-tight md:text-7xl">
          GIVE BACK
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-mute-1 leading-relaxed">
          푸르픽은 길냥이를 위한 브랜드입니다. 그래서 매출의 일부를 다시 길 위의
          아이들에게 돌려보냅니다.
        </p>
      </header>

      {/* Promise */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="container-page max-w-3xl">
          <h2 className="text-3xl font-bold md:text-4xl">우리의 약속</h2>
          <p className="mt-6 text-mute-1 leading-relaxed">
            푸르픽 셸터 1개가 판매될 때마다 <strong className="text-ink">1,000원</strong>이
            길냥이 보호 기금으로 적립됩니다. 적립금은 분기마다 정산해 사료
            지원·TNR·진료비·임시보호 단체 후원에 사용됩니다.
          </p>
          <p className="mt-4 text-mute-1 leading-relaxed">
            금액은 작아 보일 수 있지만, 한 셸터가 한 마리의 겨울을 바꾸고 그
            1,000원이 다른 한 마리의 끼니가 됩니다. 우리는 그 흐름을 끊지 않는
            게 브랜드의 의무라고 생각합니다.
          </p>
        </div>
      </section>

      {/* Current Status */}
      <section className="container-page py-16 md:py-24">
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
            CURRENT FUND
          </p>
          <p className="mt-6 text-5xl font-bold text-ink">곧 공개 예정</p>
          <p className="mt-4 text-mute-1">
            첫 정산 리포트는 2026 Q3에 공개합니다. 동물보호 단체 파트너십 발표도
            함께 진행됩니다.
          </p>
        </div>
      </section>

      {/* Uses */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="container-page">
          <h2 className="text-3xl font-bold md:text-4xl">어떻게 사용되나</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {USES.map((u) => (
              <div
                key={u.title}
                className="rounded-lg border border-line bg-white p-6"
              >
                <u.Icon
                  className="size-7 text-brand-mustard"
                  aria-hidden="true"
                />
                <h3 className="mt-4 text-lg font-semibold">{u.title}</h3>
                <p className="mt-2 text-small text-mute-1 leading-relaxed">
                  {u.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 md:py-20 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          한 마리의 겨울을 바꿔보세요.
        </h2>
        <p className="mt-4 text-mute-1">
          셸터 1개 구매 = 길냥이 보호 기금 1,000원 적립.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/shop">전체 상품 보기</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a
              href="https://instagram.com/purrpik"
              target="_blank"
              rel="noopener noreferrer"
            >
              @purrpik 팔로우
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
