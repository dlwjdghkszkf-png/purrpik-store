import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/business-info", label: "사업자정보" },
  { href: "/privacy", label: "개인정보처리방침" },
  { href: "/terms", label: "이용약관" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container-page pt-12 pb-20">
      <nav aria-label="breadcrumb" className="text-small text-mute-2">
        <Link href="/" className="hover:text-ink">
          홈
        </Link>
        <span className="mx-2">›</span>
        <span>법적 고지</span>
      </nav>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[200px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav className="rounded-lg border border-line bg-white p-4">
            <ul className="flex flex-col gap-1 text-small">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="block rounded px-3 py-2 text-mute-1 hover:bg-zinc-100 hover:text-ink"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <article className="max-w-3xl">{children}</article>
      </div>
    </div>
  );
}
