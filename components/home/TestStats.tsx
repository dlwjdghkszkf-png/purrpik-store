/**
 * TestStats — 자체 시험 수치 4종.
 * 출처: project_purrpik_product_spec.md (USP·시험 수치) + 26_purrpik_detail.html S3.
 */

const STATS = [
  { value: "99%", label: "자외선 차단", note: "AL Foil 층" },
  { value: "70kg", label: "수직 하중 변형 0mm", note: "자체 시험" },
  { value: "3,000mm↑", label: "방수 내수압", note: "자체 시험" },
  { value: "60초", label: "설치 완료", note: "도구 불필요" },
];

export function TestStats() {
  return (
    <section className="container-page py-12">
      <div className="mb-8 max-w-3xl">
        <p className="text-small font-medium uppercase tracking-[0.2em] text-brand-mustard">
          PURRPIK TEST
        </p>
        <h2 className="mt-3">자체 시험 — 숫자로 증명</h2>
      </div>

      <div className="grid grid-cols-2 divide-y divide-line rounded-lg border border-line bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {STATS.map(({ value, label, note }) => (
          <div key={label} className="p-6 md:p-8">
            <p className="text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-none tracking-tight text-ink">
              {value}
            </p>
            <p className="mt-3 text-small font-medium text-ink">{label}</p>
            <p className="mt-1 text-small text-mute-2">{note}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
