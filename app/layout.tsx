import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PromoBar } from "@/components/layout/PromoBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MiniCartDrawer } from "@/components/layout/MiniCartDrawer";
import { CookieBanner } from "@/components/layout/CookieBanner";

export const metadata: Metadata = {
  title: "푸르픽 — 길고양이 보호 셸터",
  description:
    "4중 구조 길고양이 야외 셸터. 옥스포드 600D · TPU · EPE Foam · AL Foil.",
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
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-bg text-ink">
        <PromoBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MiniCartDrawer />
        <CookieBanner />
      </body>
    </html>
  );
}
