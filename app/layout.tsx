import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PromoBar } from "@/components/layout/PromoBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MiniCartDrawer } from "@/components/layout/MiniCartDrawer";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { KakaoChannelButton } from "@/components/layout/KakaoChannelButton";
import { AnalyticsLoader } from "@/components/analytics/AnalyticsLoader";

export const metadata: Metadata = {
  title: "푸르픽 — 길고양이 보호 셸터",
  description:
    "4중 구조 길고양이 야외 셸터. 옥스포드 600D · TPU · EPE Foam · AL Foil.",
  // 검색엔진 소유확인 (공개 토큰 — 비밀 아님).
  verification: {
    google: "stJUWIR-IRK2dcJ2sid5sV3kr3sDTiNZv9tWX-YLgFI",
    other: {
      "naver-site-verification": "8a81f9fd823612ef1a819952142fb7c1a1555ec2",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://purrpik.co.kr";

  // 전역 Organization + WebSite JSON-LD (구글 지식 그래프 신호).
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "푸르픽 PURRPIK",
    alternateName: "Purrpik",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/brand/purrpik-logo.png`,
      width: 600,
      height: 600,
    },
    description:
      "길고양이를 위한 데일리 케어 브랜드. 4중 구조 야외 셸터와 데일리 케어 라인을 운영합니다.",
    foundingDate: "2026-04-20",
    sameAs: [
      "https://www.instagram.com/purrpik",
      "https://smartstore.naver.com/purrpik",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "help@purrpik.co.kr",
      areaServed: "KR",
      availableLanguage: ["Korean"],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "푸르픽 PURRPIK",
    description: "길고양이를 위한 데일리 케어 브랜드",
    publisher: { "@id": `${BASE_URL}/#organization` },
    inLanguage: "ko-KR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="푸르픽 매거진"
          href={`${BASE_URL}/rss.xml`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-bg text-ink">
        <PromoBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MiniCartDrawer />
        <CookieBanner />
        <KakaoChannelButton />
        <AnalyticsLoader />
      </body>
    </html>
  );
}
