"use client";

/**
 * Stage 12 — Cookie consent='accepted'일 때만 GA4/Meta Pixel script 로드.
 *
 * - env 미설정 시 모두 noop (graceful degradation)
 * - declined / pending 상태에서는 아무 스크립트도 로드하지 않음
 * - Stage 14에서 ecommerce 이벤트 fire 추가 예정
 */

import Script from "next/script";
import { useCookieConsent } from "@/components/layout/CookieBanner";

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function AnalyticsLoader() {
  const consent = useCookieConsent();

  if (consent !== "accepted") return null;
  if (!GA_ID && !PIXEL_ID) return null;

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
