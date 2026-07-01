import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 푸르픽",
  description: "푸르픽 개인정보처리방침 (placeholder, 사용자 보완 예정).",
  robots: { index: false, follow: false },
};

export const revalidate = 86400;

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">개인정보처리방침</h1>
      <p className="mt-3 text-small text-mute-2">
        시행일: 2026년 9월 11일 (개정 PIPA 시행일 기준)
      </p>
      <p className="mt-2 text-small text-mute-2">
        * 본 문서는 placeholder입니다. 실제 사업자 정보 및 법률 검토는 사용자가
        보완 예정.
      </p>

      <div className="mt-10 flex flex-col gap-10 text-mute-1 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-ink">1. 수집하는 개인정보 항목</h2>
          <p className="mt-3">
            제이에이치컴퍼니 (이하 “회사”)는 푸르픽 서비스 제공을 위해 다음의 개인정보를
            수집합니다.
          </p>
          <ul className="mt-3 list-disc pl-5">
            <li>비회원 주문: 이름, 휴대전화번호, 이메일, 배송지(우편번호·주소·메모)</li>
            <li>결제: 결제 수단 정보(토스페이먼츠 처리), 결제 결과 식별값</li>
            <li>고객 문의: 이메일, 문의 내용</li>
            <li>뉴스레터: 이메일, 수신 동의 일시</li>
            <li>자동 수집: IP, 쿠키, 접속 로그, 디바이스 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">2. 개인정보의 이용 목적</h2>
          <ul className="mt-3 list-disc pl-5">
            <li>주문·결제·배송·CS 처리</li>
            <li>주문번호·배송 알림톡(카카오) 발송</li>
            <li>부정 거래·이상 결제 탐지</li>
            <li>뉴스레터 발송(동의자 한정)</li>
            <li>서비스 개선을 위한 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">3. 보유 및 이용 기간</h2>
          <ul className="mt-3 list-disc pl-5">
            <li>전자상거래법: 계약·청약철회 기록 5년, 결제·재화 공급 기록 5년, 소비자 불만 처리 3년</li>
            <li>통신비밀보호법: 로그인 기록 3개월</li>
            <li>뉴스레터: 수신 거부 시 즉시 파기</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">4. 제3자 제공</h2>
          <p className="mt-3">
            회사는 이용자의 동의 또는 법령에 근거하지 않으면 개인정보를 제3자에 제공하지
            않습니다. 다음 위탁처가 있습니다.
          </p>
          <ul className="mt-3 list-disc pl-5">
            <li>토스페이먼츠 — 결제 처리</li>
            <li>솔라피(SOLAPI) — 알림톡 발송</li>
            <li>Supabase Inc. — 데이터 저장</li>
            <li>Vercel Inc. — 호스팅</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">5. 정보주체의 권리</h2>
          <p className="mt-3">
            이용자는 언제든지 본인의 개인정보 열람·정정·삭제·처리 정지를 요청할 수
            있습니다. 요청은 아래 연락처로 접수하며, 영업일 기준 7일 이내 처리합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">6. 안전성 확보 조치</h2>
          <p className="mt-3">
            회사는 개인정보의 안전한 처리를 위해 접근 통제, 암호화 저장(전송 구간 TLS),
            접근 로그 보관, 정기 보안 점검을 시행합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">7. 연락처</h2>
          <p className="mt-3">
            개인정보 보호책임자: (placeholder)
            <br />
            이메일: help@purrpik.co.kr
          </p>
        </section>
      </div>
    </>
  );
}
