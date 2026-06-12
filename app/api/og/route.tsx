/**
 * /api/og — 동적 OG 이미지 (Article 공유 카드).
 *
 * Next.js next/og ImageResponse — Edge runtime, 1200x630 PNG.
 *
 * Usage:
 *   /api/og?title=<제목>&category=<카테고리 라벨>&author=<저자명>
 *
 * Article OG 메타에서 자동 호출.
 */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get("title") ?? "푸르픽 매거진";
  const category = url.searchParams.get("category") ?? "길고양이 케어";
  const author = url.searchParams.get("author") ?? "푸르픽 편집부";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          padding: "80px 100px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 머스터드 액센트 바 (좌측) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 12,
            background: "#c17a1f",
          }}
        />

        {/* 카테고리 라벨 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 28,
            fontWeight: 600,
            color: "#c17a1f",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {category}
        </div>

        {/* 제목 */}
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#0a0a0a",
            marginTop: 30,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxHeight: 320,
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        {/* 하단 풋터 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
            paddingTop: 40,
            borderTop: "2px solid #f0f0f0",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#0a0a0a" }}>
              푸르픽 PURRPIK
            </div>
            <div style={{ fontSize: 22, color: "#737373", marginTop: 6 }}>
              {author} · 수의사 자문 검증
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#737373",
            }}
          >
            purrpik.co.kr
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
