import { Droplets, Sun, Layers, Shield } from "lucide-react";

/**
 * Layer4 — 4중 구조 시연 섹션.
 *
 * 카피 출처: project_purrpik_product_spec.md (4중 구조) + 26_purrpik_detail.html S4.
 * 톤: 자재명·수치 그대로 유지 (스펙 용어 보존).
 */

type Layer = {
  no: string;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const LAYERS: Layer[] = [
  {
    no: "01",
    title: "Oxford 600D + PU 코팅",
    desc: "방수 내수압 3,000mm 이상 + 자외선 99% 차단.",
    Icon: Droplets,
  },
  {
    no: "02",
    title: "AL Foil 반사재",
    desc: "여름 외부 열기를 반사하고, 겨울 체온을 안으로 가둡니다.",
    Icon: Sun,
  },
  {
    no: "03",
    title: "EPE Foam 5mm",
    desc: "지면 복사열·냉기 차단. 눌림 회복률 96% — 70kg 하중 변형 0mm.",
    Icon: Layers,
  },
  {
    no: "04",
    title: "TPU 방수 바닥재",
    desc: "고양이 발톱에도 손상 없는 내구 표면. 빗물 침투 차단.",
    Icon: Shield,
  },
];

export function Layer4() {
  return (
    <section id="layer4" className="bg-zinc-50 py-16 md:py-24">
      <div className="container-page">
        <div className="mb-10 max-w-3xl">
          <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
            4 LAYER STRUCTURE
          </p>
          <h2 className="mt-3">
            4중 레이어 — 비·바람·열기·바닥을 동시에 차단
          </h2>
          <p className="mt-3 text-mute-1">
            옥스포드 외피부터 TPU 바닥재까지, 각 층이 서로 다른 위협을 막습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {LAYERS.map(({ no, title, desc, Icon }) => (
            <article
              key={no}
              className="flex h-full flex-col rounded-lg border border-line bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-[24px] font-bold tabular-nums text-brand-mustard">
                  {no}
                </span>
                <Icon className="size-6 text-mute-1" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-h3 font-semibold leading-tight">
                LAYER {no}
              </h3>
              <p className="mt-2 text-small font-medium text-ink">{title}</p>
              <p className="mt-3 text-small text-mute-1 leading-relaxed">
                {desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
