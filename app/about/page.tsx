import type { Metadata } from "next";
import Link from "next/link";
import { Droplets, Sun, Layers, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "브랜드 스토리 — 푸르픽",
  description: "골목의 그 아이를 위해 — 푸르픽 브랜드 스토리와 제품 철학.",
};

export const revalidate = 86400;

const LAYERS = [
  { no: "01", title: "Oxford 600D + PU 코팅", Icon: Droplets },
  { no: "02", title: "AL Foil 반사재", Icon: Sun },
  { no: "03", title: "EPE Foam 5mm", Icon: Layers },
  { no: "04", title: "TPU 방수 바닥재", Icon: Shield },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <header className="container-page pt-16 pb-12 md:pt-24 md:pb-16">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          BRAND STORY
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          골목의 그 아이를 위해.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-mute-1 leading-relaxed">
          푸르픽은 길 위에서 계절을 견디는 고양이들을 위해 만들어졌습니다. 한
          끼의 사료보다 오래 남는 것, 한 번의 마음보다 한 계절을 버텨내는 것 —
          그게 우리가 만드는 셸터의 기준입니다.
        </p>
      </header>

      {/* Mission */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="container-page max-w-3xl">
          <h2 className="text-3xl font-bold md:text-4xl">왜 푸르픽인가</h2>
          <div className="mt-8 flex flex-col gap-5 text-mute-1 leading-relaxed">
            <p>
              시중 길고양이집의 90%는 단열재 없는 단겹 천막에 가깝습니다. 비가
              들이치고, 여름엔 내부가 35도를 넘기고, 겨울엔 바닥 냉기를 막지
              못합니다. 길에 두면 1년을 못 가는 제품도 흔합니다.
            </p>
            <p>
              푸르픽은 정반대를 택했습니다. 외장재는 Oxford 600D + PU 코팅으로
              내수압 3,000mm를 확보하고, 바닥은 EPE Foam 5mm + TPU 방수재로
              지면 냉기와 습기를 끊었습니다. 자외선 99% 차단으로 외장 변색·열화
              속도를 늦췄습니다.
            </p>
            <p>
              디자인도 의도된 결과입니다. 무광 블랙 단색은 골목·주차장·옥상에
              놓아도 시야에 튀지 않습니다. 이웃 민원을 줄이고, 길냥이 본인도
              안정감을 느끼는 색입니다.
            </p>
            <p>
              우리는 한 번 사고 잊을 셸터를 만들지 않습니다. 한 계절, 두 계절,
              네 번의 계절을 버티는 셸터를 만듭니다.
            </p>
          </div>
        </div>
      </section>

      {/* Product Philosophy */}
      <section className="container-page py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
            PRODUCT PHILOSOPHY
          </p>
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            4중 구조로 설계된 길고양이 보호 셸터
          </h2>
          <p className="mt-6 text-mute-1 leading-relaxed">
            푸르픽의 모든 모델은 동일한 4중 구조를 공유합니다. 사이즈와 구성만
            다를 뿐, 보호 성능에는 타협이 없습니다.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {LAYERS.map((l) => (
            <div
              key={l.no}
              className="rounded-lg border border-line bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <l.Icon
                  className="size-6 text-brand-mustard"
                  aria-hidden="true"
                />
                <span className="text-small font-medium text-mute-2">
                  {l.no}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug">
                {l.title}
              </h3>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button asChild variant="outline">
            <Link href="/care-guide#잠자리">4중 구조 상세 보기</Link>
          </Button>
        </div>
      </section>

      {/* Company */}
      <section className="bg-zinc-50 py-16 md:py-24">
        <div className="container-page max-w-3xl">
          <h2 className="text-3xl font-bold md:text-4xl">신성컴퍼니 소개</h2>
          <p className="mt-6 text-mute-1 leading-relaxed">
            푸르픽은 (주)신성컴퍼니의 길고양이 보호 셸터 브랜드입니다. 우리는
            반려동물·길동물 용품을 직접 설계·제조·유통하며, 시장의 통념을
            의심하는 제품만 만듭니다.
          </p>
          <p className="mt-4 text-small text-mute-2">
            * 회사 소개 본문은 사용자가 보완 예정.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 md:py-20 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          한 마리의 겨울을 바꿔보세요.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/shop">전체 상품 보기</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/give-back">GIVE BACK 캠페인</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
