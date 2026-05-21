import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 푸르픽",
  description: "푸르픽 이용약관 (placeholder).",
  robots: { index: false, follow: false },
};

export const revalidate = 86400;

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">이용약관</h1>
      <p className="mt-3 text-small text-mute-2">시행일: 2026년 9월 11일</p>
      <p className="mt-2 text-small text-mute-2">
        * 본 문서는 placeholder입니다. 법률 검토는 사용자가 보완 예정.
      </p>

      <div className="mt-10 flex flex-col gap-10 text-mute-1 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-ink">제1조 (목적)</h2>
          <p className="mt-3">
            본 약관은 (주)신성컴퍼니(이하 “회사”)가 운영하는 푸르픽
            (purrpik.co.kr, 이하 “사이트”)에서 제공하는 전자상거래 관련 서비스를
            이용함에 있어 회사와 이용자의 권리·의무 및 책임 사항을 규정함을
            목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제2조 (회원가입)</h2>
          <p className="mt-3">
            본 사이트는 현재 비회원 결제만 제공합니다. 향후 회원 서비스가
            도입될 경우 별도 약관과 함께 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제3조 (서비스 이용)</h2>
          <p className="mt-3">
            회사는 다음 서비스를 제공합니다 — 상품 정보 제공, 주문·결제, 배송,
            교환·환불, 고객 문의 응대, 뉴스레터(동의자 한정).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제4조 (결제·환불)</h2>
          <ol className="mt-3 list-decimal pl-5 flex flex-col gap-2">
            <li>
              결제는 토스페이먼츠를 통해 처리되며, 신용카드·계좌이체·간편결제
              등을 지원합니다.
            </li>
            <li>
              회사는 <strong className="text-ink">30일 만족보증 정책</strong>을
              운영합니다. 수령일로부터 30일 이내 미사용·재판매 가능 상태로
              반품 요청 시 전액 환불됩니다(단, 단순 변심에 의한 왕복 배송비는
              구매자 부담).
            </li>
            <li>
              상품 하자·오배송의 경우 배송비 포함 전액 환불 또는 무상 교환
              처리됩니다.
            </li>
            <li>
              자세한 환불 절차는 <a href="/faq#refund" className="text-brand-mustard underline">FAQ</a> 참조.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제5조 (면책)</h2>
          <p className="mt-3">
            회사는 천재지변, 통신 장애, 결제 대행사 장애 등 회사의 합리적 통제를
            벗어난 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제6조 (분쟁 해결)</h2>
          <p className="mt-3">
            본 약관과 관련된 분쟁은 대한민국 법률에 따라 해석되며, 서울중앙지방법원을
            제1심 관할 법원으로 합니다.
          </p>
        </section>
      </div>
    </>
  );
}
