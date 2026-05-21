import Link from "next/link";

export default function Home() {
  return (
    <main className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="text-small uppercase tracking-widest text-mute-1">
        Purrpik · 푸르픽
      </p>
      <h1 className="mt-4">길고양이를 위한 4중 구조 야외 셸터</h1>
      <p className="mt-6 max-w-xl text-mute-1">
        Stage 1 디자인 시스템 완료. 풀 자사몰은 Stage 2부터 시작됩니다.
      </p>
      <Link
        href="/dev/design-system"
        className="mt-10 inline-flex items-center text-small underline underline-offset-4 hover:text-brand-mustard"
      >
        디자인 시스템 미리보기 →
      </Link>
    </main>
  );
}
