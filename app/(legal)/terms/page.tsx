import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — 푸르픽",
  description: "푸르픽(purrpik.co.kr) 이용약관 — 전자상거래 표준약관(공정거래위원회 제10023호) 준용.",
};

export const revalidate = 86400;

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">이용약관</h1>
      <p className="mt-3 text-small text-mute-2">시행일: 2026년 7월 9일</p>
      <p className="mt-2 text-small text-mute-2">
        본 약관은 공정거래위원회 표준약관 제10023호(전자상거래(인터넷사이버몰)
        표준약관)를 준용하여 작성되었습니다.
      </p>

      <div className="mt-10 flex flex-col gap-10 text-mute-1 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-ink">제1조 (목적)</h2>
          <p className="mt-3">
            이 약관은 제이에이치컴퍼니(전자상거래 사업자, 이하 “회사”)가 운영하는
            푸르픽(purrpik.co.kr, 이하 “몰”)에서 제공하는 인터넷 관련 서비스(이하
            “서비스”)를 이용함에 있어 “몰”과 이용자의 권리·의무 및 책임사항을
            규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제2조 (정의)</h2>
          <ol className="mt-3 list-decimal pl-5 flex flex-col gap-2">
            <li>
              “몰”이란 회사가 재화 또는 용역(이하 “재화 등”)을 이용자에게
              제공하기 위하여 정보통신설비를 이용하여 재화 등을 거래할 수
              있도록 설정한 가상의 영업장을 말하며, 아울러 사이버몰을 운영하는
              사업자의 의미로도 사용합니다.
            </li>
            <li>“이용자”란 “몰”에 접속하여 이 약관에 따라 “몰”이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
            <li>“회원”이란 “몰”에 회원등록을 한 자로서, 계속적으로 “몰”이 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
            <li>“비회원”이란 회원에 가입하지 않고 “몰”이 제공하는 서비스를 이용하는 자를 말합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제3조 (약관 등의 명시와 설명 및 개정)
          </h2>
          <p className="mt-3">
            “몰”은 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소,
            전화번호, 전자우편주소, 사업자등록번호, 통신판매업 신고번호,
            개인정보관리책임자 등을 이용자가 쉽게 알 수 있도록 초기 화면 및
            아래 사업자정보 페이지에 게시합니다.
          </p>
          <ul className="mt-3 list-disc pl-5 flex flex-col gap-1">
            <li>상호: 제이에이치컴퍼니 | 대표자: 이정환</li>
            <li>사업장 주소: 경기도 파주시 고봉로 755-27, 가동 201-A52호(상지석동)</li>
            <li>사업자등록번호: 263-13-02666 | 통신판매업신고: 2024-경기파주-1305호</li>
            <li>유선번호: 010-2058-0176 | 이메일: help@purrpik.co.kr</li>
            <li>
              자세한 사업자정보는{" "}
              <a href="/business-info" className="text-brand-mustard underline">
                사업자정보 페이지
              </a>
              에서 확인하실 수 있습니다.
            </li>
          </ul>
          <p className="mt-3">
            “몰”은 이용자가 약관에 동의하기에 앞서 청약철회·배송책임·환불조건
            등 중요한 내용을 이용자가 이해할 수 있도록 별도의 연결화면 또는
            팝업화면 등을 제공하여 확인을 구합니다. “몰”은 관련 법령을
            위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시
            적용일자 및 개정사유를 명시하여 적용일자 7일 이전부터 공지합니다
            (이용자에게 불리한 변경은 최소 30일 이상의 유예기간을 둡니다).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제4조 (서비스의 제공 및 변경)
          </h2>
          <p className="mt-3">“몰”은 다음 업무를 수행합니다.</p>
          <ol className="mt-3 list-decimal pl-5 flex flex-col gap-1">
            <li>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
            <li>구매계약이 체결된 재화 또는 용역의 배송</li>
            <li>기타 “몰”이 정하는 업무</li>
          </ol>
          <p className="mt-3">
            재화 등의 품절 또는 사양 변경 시 내용 및 제공일자를 명시하여 즉시
            공지하며, 이로 인해 이용자가 입은 손해는 “몰”의 고의·과실이 없음이
            입증되지 않는 한 배상합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제5조 (서비스의 중단)</h2>
          <p className="mt-3">
            “몰”은 정보통신설비의 보수점검·교체, 통신 두절 등의 사유로 서비스
            제공을 일시적으로 중단할 수 있으며, 이로 인한 손해는
            고의·과실이 없음이 입증되지 않는 한 배상합니다. 사업 포기 등의
            사유로 서비스를 지속할 수 없는 경우 제8조에 정한 방법으로
            통지하고 제시한 조건에 따라 보상합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제6조 (회원가입)</h2>
          <p className="mt-3">
            본 사이트는 현재 비회원 주문·결제만 제공합니다. 회원가입 시
            이용자는 “몰”이 정한 양식에 따라 정보를 기입하고 이 약관에
            동의함으로써 가입을 신청하며, 허위 기재·부정 목적 등이 없는 한
            “몰”은 이를 승낙합니다. 회원 서비스가 도입될 경우 본 조에 따라
            운영되며 별도로 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제7조 (회원 탈퇴 및 자격 상실 등)
          </h2>
          <p className="mt-3">
            회원은 언제든지 탈퇴를 요청할 수 있으며 “몰”은 즉시 처리합니다.
            가입 시 허위 등록, 대금 미지급, 전자상거래 질서 위협, 법령·약관
            위반 등의 사유가 있는 경우 “몰”은 회원자격을 제한·정지하거나,
            시정되지 않을 경우 상실시킬 수 있습니다. 자격 상실 시 사전 통지
            및 최소 30일의 소명 기회를 부여합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제8조 (회원에 대한 통지)</h2>
          <p className="mt-3">
            “몰”이 회원에게 통지하는 경우 회원이 지정한 전자우편 주소로 할 수
            있습니다. 불특정다수 회원에 대한 통지는 1주일 이상 게시함으로써
            개별 통지에 갈음할 수 있으나, 거래에 중대한 영향을 미치는 사항은
            개별 통지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제9조 (구매신청 및 개인정보 제공 동의 등)
          </h2>
          <p className="mt-3">
            이용자는 “몰”에서 재화 등의 검색·선택, 배송정보 입력, 약관·청약철회
            제한·비용부담 내용 확인, 약관 동의, 구매신청 확인, 결제방법 선택의
            절차로 구매를 신청합니다. “몰”이 제3자에게 개인정보를 제공하거나
            처리를 위탁하는 경우 그 대상·목적·항목·보유기간 등을 알리고 동의를
            받습니다. 자세한 사항은{" "}
            <a href="/privacy" className="text-brand-mustard underline">
              개인정보처리방침
            </a>
            을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제10조 (계약의 성립)</h2>
          <p className="mt-3">
            “몰”은 신청 내용에 허위·기재누락·오기가 있거나 미성년자가
            청소년보호법상 금지 재화를 구매하는 경우 등 승낙이 어려운 사유가
            있으면 승낙하지 않을 수 있습니다. 계약은 “몰”의 승낙이
            수신확인통지 형태로 이용자에게 도달한 시점에 성립합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제11조 (지급방법)</h2>
          <p className="mt-3">
            재화 등의 대금은 다음 방법 중 가용한 방법으로 지급할 수 있으며,
            “몰”은 지급방법을 이유로 대금에 어떠한 명목의 수수료도 추가
            징수하지 않습니다.
          </p>
          <ol className="mt-3 list-decimal pl-5 flex flex-col gap-1">
            <li>신용카드·계좌이체 등 간편결제(토스페이먼츠 결제위젯)</li>
            <li>온라인 무통장입금</li>
            <li>기타 “몰”이 도입하는 전자적 지급 방법</li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제12조 (수신확인통지·구매신청 변경 및 취소)
          </h2>
          <p className="mt-3">
            “몰”은 구매신청이 있으면 이용자에게 수신확인통지를 합니다.
            이용자는 의사표시 불일치 시 즉시 변경·취소를 요청할 수 있고,
            “몰”은 배송 전이라면 지체 없이 처리합니다. 이미 대금을 지불한
            경우에는 제15조(청약철회 등)에 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제13조 (재화 등의 공급)</h2>
          <p className="mt-3">
            별도 약정이 없는 한 청약일로부터 7일 이내(대금을 받은 경우 3영업일
            이내)에 배송에 필요한 조치를 취하며, 배송수단·비용부담자·배송기간을
            명시합니다. 약정 배송기간을 초과한 경우 “몰”의 고의·과실이
            없음이 입증되지 않는 한 손해를 배상합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제14조 (환급)</h2>
          <p className="mt-3">
            품절 등의 사유로 재화 등을 공급할 수 없는 경우 지체 없이 그
            사유를 통지하고, 이미 대금을 받았다면 받은 날로부터 3영업일
            이내에 환급하거나 환급에 필요한 조치를 취합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제15조 (청약철회 등)</h2>
          <ol className="mt-3 list-decimal pl-5 flex flex-col gap-2">
            <li>
              이용자는 계약 내용에 관한 서면을 받은 날(그보다 재화 공급이
              늦으면 공급받은 날)부터 7일 이내에 청약을 철회할 수 있습니다.
              나아가 “몰”은{" "}
              <strong className="text-ink">30일 만족보증 정책</strong>을
              운영하여, 수령일로부터 30일 이내 미사용·재판매 가능 상태이면
              법정 기간을 넘어서도 환불을 지원합니다(단순 변심 시 왕복
              배송비는 이용자 부담).
            </li>
            <li>
              이용자에게 책임 있는 사유로 재화가 멸실·훼손된 경우, 사용·일부
              소비로 가치가 현저히 감소한 경우, 시간 경과로 재판매가 곤란할
              정도로 가치가 감소한 경우, 복제 가능한 재화의 원본 포장을
              훼손한 경우에는 반품·교환이 제한됩니다. 다만 “몰”이 이 사실을
              사전에 명기하지 않았다면 제한되지 않습니다.
            </li>
            <li>
              재화 등의 내용이 표시·광고와 다르거나 계약과 다르게 이행된
              경우에는 공급받은 날로부터 3개월 이내, 그 사실을 안 날로부터
              30일 이내에 청약철회를 할 수 있습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제16조 (청약철회 등의 효과)
          </h2>
          <p className="mt-3">
            “몰”은 재화 등을 반환받은 경우 3영업일 이내에 대금을 환급하며,
            신용카드 등으로 결제한 경우 지체 없이 결제수단 제공자에게 대금
            청구의 정지·취소를 요청합니다. 반환에 필요한 비용은 이용자가
            부담하되(단순 변심), 표시·광고와 다르거나 “몰”의 귀책 사유로
            인한 청약철회는 “몰”이 부담합니다. 상품 하자·오배송의 경우
            배송비 포함 전액 환불 또는 무상 교환됩니다. 자세한 절차는{" "}
            <a href="/faq#refund" className="text-brand-mustard underline">
              FAQ
            </a>
            를 참조하세요.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제17조 (개인정보보호)</h2>
          <p className="mt-3">
            “몰”은 서비스 제공에 필요한 최소한의 개인정보만 수집하며, 목적
            외 용도로 이용하지 않습니다. 이용자는 언제든 자신의 개인정보
            열람·정정을 요구할 수 있습니다. 자세한 사항은{" "}
            <a href="/privacy" className="text-brand-mustard underline">
              개인정보처리방침
            </a>
            을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제18조 (“몰”의 의무)</h2>
          <p className="mt-3">
            “몰”은 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지
            않으며, 지속적·안정적으로 재화·용역을 제공하기 위해 최선을
            다합니다. 이용자의 개인정보 보호를 위한 보안 시스템을 갖추며,
            부당한 표시·광고로 이용자가 손해를 입은 경우 이를 배상합니다.
            이용자가 원하지 않는 영리 목적의 광고성 전자우편을 발송하지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제19조 (회원의 ID 및 비밀번호에 대한 의무)
          </h2>
          <p className="mt-3">
            ID와 비밀번호에 관한 관리책임은 회원에게 있으며, 제3자에게
            이용하게 해서는 안 됩니다. 도난·부정사용을 인지한 경우 즉시
            “몰”에 통보하고 안내에 따라야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제20조 (이용자의 의무)</h2>
          <p className="mt-3">
            이용자는 신청·변경 시 허위 내용 등록, 타인 정보 도용, 게시 정보
            변경, “몰”이 정한 정보 이외의 정보 송신·게시, 지식재산권 침해,
            명예 손상·업무 방해, 공서양속에 반하는 정보 게시 행위를 하여서는
            안 됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제21조 (연결“몰”과 피연결“몰” 간의 관계)
          </h2>
          <p className="mt-3">
            “몰”이 하이퍼링크로 제3자의 웹사이트(피연결몰)와 연결된 경우,
            “몰”은 그 초기화면 또는 연결 시점에 보증 책임이 없음을 명시한
            때에는 피연결몰이 독자적으로 제공하는 거래에 대해 책임을 지지
            않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">
            제22조 (저작권의 귀속 및 이용제한)
          </h2>
          <p className="mt-3">
            “몰”이 작성한 저작물에 대한 저작권 기타 지적재산권은 “몰”에
            귀속합니다. 이용자는 “몰”의 사전 승낙 없이 이를 복제·송신·출판·배포·방송
            등의 방법으로 영리 목적으로 이용하거나 제3자에게 이용하게 할 수
            없습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제23조 (분쟁 해결)</h2>
          <p className="mt-3">
            “몰”은 이용자가 제기하는 의견·불만을 우선적으로 처리하며, 신속한
            처리가 곤란한 경우 그 사유와 처리 일정을 즉시 통보합니다. 문의는{" "}
            <a href="mailto:help@purrpik.co.kr" className="text-brand-mustard underline">
              help@purrpik.co.kr
            </a>
            로 접수하며, 전자상거래 분쟁 관련 피해구제 신청이 있는 경우
            공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에
            따를 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">제24조 (재판권 및 준거법)</h2>
          <p className="mt-3">
            “몰”과 이용자 간 전자상거래 분쟁에 관한 소송은 제소 당시 이용자의
            주소(주소가 없는 경우 거소)를 관할하는 지방법원의 전속관할로
            하며, 주소·거소가 분명하지 않거나 외국 거주자의 경우 민사소송법상
            관할법원에 제기합니다. 준거법은 대한민국 법률로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-ink">부칙</h2>
          <p className="mt-3">이 약관은 2026년 7월 9일부터 시행합니다.</p>
        </section>
      </div>
    </>
  );
}
