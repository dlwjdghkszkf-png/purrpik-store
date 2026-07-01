import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사업자정보 — 푸르픽",
  description: "푸르픽 운영사 사업자정보 (전자상거래법 의무 표시).",
};

export const revalidate = 86400;

const ROWS: { k: string; v: string }[] = [
  { k: "상호", v: "제이에이치컴퍼니" },
  { k: "대표자", v: "이정환" },
  { k: "사업자등록번호", v: "263-13-02666" },
  { k: "통신판매업신고", v: "2024-경기파주-1305호" },
  { k: "사업장 주소", v: "경기도 파주시 고봉로 755-27, 가동 201-A52호(상지석동)" },
  { k: "유선번호", v: "010-2058-0176" },
  { k: "이메일", v: "help@purrpik.co.kr" },
  { k: "호스팅 제공자", v: "Vercel Inc." },
];

export default function BusinessInfoPage() {
  return (
    <>
      <h1 className="text-3xl font-bold md:text-4xl">사업자정보</h1>
      <p className="mt-3 text-small text-mute-2">
        전자상거래 등에서의 소비자보호에 관한 법률에 따른 사업자 정보입니다.
      </p>

      <div className="mt-10 overflow-hidden rounded-lg border border-line bg-white">
        <table className="w-full text-small">
          <tbody>
            {ROWS.map((r, i) => (
              <tr
                key={r.k}
                className={i !== ROWS.length - 1 ? "border-b border-line" : ""}
              >
                <th
                  scope="row"
                  className="w-40 bg-zinc-50 px-5 py-4 text-left font-semibold text-mute-1"
                >
                  {r.k}
                </th>
                <td className="px-5 py-4 text-ink">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-small text-mute-2">
        본 사이트는 <strong className="text-ink">전자상거래 등에서의 소비자보호에 관한 법률</strong>에 따른
        통신판매업자입니다. 결제·환불 관련 문의는 help@purrpik.co.kr로 보내주세요.
      </p>
    </>
  );
}
