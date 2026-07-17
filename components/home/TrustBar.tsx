import { Truck, Timer, ShieldCheck, RotateCcw } from "lucide-react";

/**
 * TrustBar — 히어로 직하 신뢰 스트립.
 * 구매 결정 지점에서 배송·설치·내구·환불 4대 안심 요소를 한 줄로 전달.
 * 카피는 자체 시험/정책 근거 기반(무료배송·60초 설치·70kg 하중·30일 환불).
 */
const ITEMS = [
  { icon: Truck, title: "전국 무료배송", sub: "장마 전 도착 보장" },
  { icon: Timer, title: "60초 설치", sub: "도구·접착제 불필요" },
  { icon: ShieldCheck, title: "70kg 하중", sub: "자체 시험 변형 0mm" },
  { icon: RotateCcw, title: "30일 환불보장", sub: "만족 못하면 전액" },
];

export function TrustBar() {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-page">
        <ul className="grid grid-cols-2 divide-line md:grid-cols-4 md:divide-x">
          {ITEMS.map(({ icon: Icon, title, sub }) => (
            <li
              key={title}
              className="flex items-center gap-3 px-1 py-4 md:justify-center md:px-4 md:py-5"
            >
              <Icon
                className="size-6 shrink-0 text-brand-mustard"
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="text-[12px] text-mute-1">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
