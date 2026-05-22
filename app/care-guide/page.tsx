import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "길고양이 돌봄 가이드 — 푸르픽",
  description:
    "초보 캣맘·캣대디를 위한 5분 가이드. 밥과 물, 잠자리, 계절별 관리, TNR, 이웃과의 공존, 동물보호법까지 — 길고양이 돌봄에 꼭 필요한 7가지 핵심.",
  openGraph: {
    title: "길고양이 돌봄 가이드 — 푸르픽",
    description:
      "밥·물, 셸터, 계절별 관리, TNR, 민원 회피, 학대 신고까지. 길냥이를 처음 만난 사람을 위한 실전 가이드.",
  },
};

// SEO 콘텐츠 — 24h ISR.
export const revalidate = 86400;

const SECTIONS = [
  { id: "start", title: "01. 시작하기 전에" },
  { id: "food", title: "02. 밥과 물" },
  { id: "shelter", title: "03. 잠자리" },
  { id: "season", title: "04. 계절별 관리" },
  { id: "health", title: "05. 건강과 안전" },
  { id: "neighbor", title: "06. 이웃과의 공존" },
  { id: "law", title: "07. 법적 보호" },
];

export default function CareGuidePage() {
  return (
    <>
      <header className="container-page pt-12 pb-8">
        <nav aria-label="breadcrumb" className="text-small text-mute-2">
          <Link href="/" className="hover:text-ink">
            홈
          </Link>
          <span className="mx-2">›</span>
          <span>돌봄 가이드</span>
        </nav>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">
          길고양이 돌봄 가이드
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-mute-1">
          초보 캣맘·캣대디를 위한 5분 가이드.
        </p>
      </header>

      <div className="container-page grid grid-cols-1 gap-10 pb-20 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="목차" className="rounded-lg border border-line bg-white p-5">
            <p className="mb-3 text-small font-semibold text-mute-1">목차</p>
            <ul className="flex flex-col gap-2 text-small">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block text-mute-1 hover:text-brand-mustard"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Body */}
        <article className="prose-base flex flex-col gap-14">
          <section id="start" className="scroll-mt-24">
            <h2 className="text-2xl font-bold md:text-3xl">01. 시작하기 전에</h2>
            <div className="mt-5 flex flex-col gap-4 text-mute-1 leading-relaxed">
              <p>
                길고양이와 집고양이는 같은 종이지만 살아가는 방식이 다릅니다.
                집고양이는 사람의 보호 안에서 정해진 자원으로 살고, 길고양이는
                영역과 계절을 스스로 견딥니다. 돌봄을 시작한다는 건 한두 번의
                급여가 아니라 그 아이의 일상 일부가 된다는 뜻입니다.
              </p>
              <p>
                책임의 무게가 부담스럽다면, 정기 급여 대신 임시 보호 단체를 후원하는
                방식부터 시작해도 좋습니다. 일단 밥자리를 만들면 길냥이는 그 자리를
                생존 거점으로 학습합니다. 중간에 끊기면 위험합니다.
              </p>
            </div>
          </section>

          <section id="food" className="scroll-mt-24">
            <h2 className="text-2xl font-bold md:text-3xl">02. 밥과 물</h2>
            <div className="mt-5 flex flex-col gap-4 text-mute-1 leading-relaxed">
              <p>
                사료는 가격보다 단백질·지방 함량을 봐야 합니다. 길냥이는 야외
                활동량이 많아 에너지 소모가 큽니다. 단백질 30% 이상, 지방 12%
                이상의 성묘용 건식 사료가 기본입니다. 습식은 수분 섭취에
                도움이 되지만 상온에서 빨리 상하니 그 자리에서 다 먹을 만큼만
                급여합니다.
              </p>
              <p>
                물은 사료보다 더 중요합니다. 길에는 깨끗한 물이 거의 없습니다.
                매일 새 물로 갈아주고, 한여름엔 얼음 한 조각을, 한겨울엔 미지근한
                물을 준비합니다. 그릇은 사료와 30cm 이상 떨어진 곳에 두는 게
                좋습니다 — 고양이는 본능적으로 사료 옆 물을 잘 마시지 않습니다.
              </p>
              <p>
                자리는 사람 통행이 적은 화단·주차장 구석·계단 밑이 좋습니다.
                CCTV가 보이는 곳은 학대 위험을 줄여줍니다.
              </p>
            </div>
          </section>

          <section id="shelter" className="scroll-mt-24">
            <h2 className="text-2xl font-bold md:text-3xl">03. 잠자리</h2>
            <div className="mt-5 flex flex-col gap-4 text-mute-1 leading-relaxed">
              <p>
                길냥이에게 잠자리는 단순한 박스가 아니라 체온을 지키는 마지막
                보루입니다. 좋은 셸터는 세 가지 조건을 만족합니다 — 빗물이 안
                들이치는 방수성, 지면 냉기를 끊는 단열성, 입구가 너무 크지 않은
                보호성.
              </p>
              <p>
                일반 스티로폼 박스나 단겹 텐트는 단열재가 없거나 외장이 약해
                한 계절을 넘기기 어렵습니다.{" "}
                <Link
                  href="/shop/purrpik-shelter?sku=allinone-l"
                  className="text-brand-mustard underline underline-offset-2 hover:text-brand-mustard-deep"
                >
                  푸르픽 ALL-IN-ONE L
                </Link>{" "}
                같은 4중 구조(Oxford 600D + AL Foil + EPE Foam + TPU) 셸터는
                방수·단열·내구를 한 번에 해결합니다.
              </p>
              <p>
                위치는 사방이 막힌 모서리, 바람이 정면으로 들이치지 않는
                벽 옆이 가장 좋습니다. 여름엔 직사광을 피한 그늘에, 겨울엔
                햇빛이 닿는 남향에 두면 셸터 자체 보온 효과가 올라갑니다.
              </p>
            </div>
          </section>

          <section id="season" className="scroll-mt-24">
            <h2 className="text-2xl font-bold md:text-3xl">04. 계절별 관리</h2>
            <div className="mt-5 flex flex-col gap-6 text-mute-1 leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-ink">여름</h3>
                <p className="mt-2">
                  35도가 넘는 셸터는 오히려 위험합니다. AL Foil 반사재가 있는
                  셸터는 외부 열기를 차단해 내부 온도를 5~7도 낮춥니다. 쿨매트나
                  얼린 페트병을 셸터 옆에 두면 추가 도움이 됩니다. 물그릇은
                  하루 2번 갈아주세요.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">겨울</h3>
                <p className="mt-2">
                  영하 5도 이하에선 EPE Foam 5mm 단열재가 사실상 필수입니다.
                  바닥 냉기는 얇은 천이나 스티로폼으로는 막히지 않습니다. 입구는
                  바람을 등진 방향으로 두고, 비닐 천이나 두꺼운 천으로 가림막을
                  더하면 보온이 크게 올라갑니다.
                </p>
              </div>
            </div>
          </section>

          <section id="health" className="scroll-mt-24">
            <h2 className="text-2xl font-bold md:text-3xl">05. 건강과 안전</h2>
            <div className="mt-5 flex flex-col gap-4 text-mute-1 leading-relaxed">
              <p>
                TNR(Trap-Neuter-Return, 포획–중성화–방사)은 길냥이 개체수를
                안정시키고 영역 다툼·울음·번식 스트레스를 줄이는 가장 검증된
                방법입니다. 각 지자체 동물보호 부서나 캣맘 모임에 문의하면
                지원받을 수 있습니다.
              </p>
              <p>
                다친 길냥이를 발견했다면 동물보호 핫라인{" "}
                <strong>1577-0954</strong> 또는 가까운 동물병원에 연락하세요.
                구청·시청 동물보호 부서도 24시간 신고를 받습니다.
              </p>
            </div>
          </section>

          <section id="neighbor" className="scroll-mt-24">
            <h2 className="text-2xl font-bold md:text-3xl">06. 이웃과의 공존</h2>
            <div className="mt-5 flex flex-col gap-4 text-mute-1 leading-relaxed">
              <p>
                길냥이 돌봄에서 가장 큰 변수는 이웃입니다. 셸터를 보이는 자리에
                두면 민원이 들어오기 쉽고, 민원이 들어오면 셸터 자체가 철거되는
                경우가 많습니다.
              </p>
              <p>
                실전 팁 세 가지 — (1) 무광 블랙 단색 셸터를 고르면 시야에 덜
                튑니다. (2) 사료 자국·물 흘림을 매번 닦아 흔적을 최소화합니다.
                (3) 입구가 사람 통로를 향하지 않도록 방향을 돌려놓습니다.
              </p>
            </div>
          </section>

          <section id="law" className="scroll-mt-24">
            <h2 className="text-2xl font-bold md:text-3xl">07. 법적 보호</h2>
            <div className="mt-5 flex flex-col gap-4 text-mute-1 leading-relaxed">
              <p>
                동물보호법상 길고양이도 보호 대상 동물입니다. 학대·유기·살해
                행위는 처벌됩니다(최대 3년 이하 징역 또는 3,000만원 이하 벌금).
                의심 정황을 목격했다면 사진·영상 증거를 확보하고 신고하세요.
              </p>
              <p>
                긴급 신고는 <strong>국번없이 112</strong>, 동물보호 전문 신고는{" "}
                <strong>1577-0954</strong>입니다. 캣맘 활동 자체는 합법이며,
                과도한 민원·방해 행위는 오히려 업무방해에 해당할 수 있습니다.
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-lg border border-line bg-zinc-50 p-8 text-center">
            <h2 className="text-xl font-bold">한 마리의 겨울을 바꿔보세요</h2>
            <p className="mt-3 text-mute-1">
              푸르픽은 매 판매 1건당 1,000원을 길냥이 보호 기금으로 적립합니다.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/shop">셸터 보러가기</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/give-back">GIVE BACK</Link>
              </Button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
