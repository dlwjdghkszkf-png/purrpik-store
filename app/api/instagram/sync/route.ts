/**
 * GET /api/instagram/sync
 * Stage 13 — Vercel Cron `0 *​/6 * * *` (6시간 간격).
 *
 * MVP: stub. instagram_posts placeholder 12건이 시드에 들어가 있음 (Stage 2).
 * P2에서 Instagram Basic Display API 통합 예정.
 *
 * 인증: Vercel Cron `Authorization: Bearer ${CRON_SECRET}`.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "unauthorized" },
    { status: 401 },
  );
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return unauthorized();

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) return unauthorized();

  // TODO P2: Instagram Basic Display API 통합
  // 1. IG_ACCESS_TOKEN으로 fetch https://graph.instagram.com/me/media
  //    ?fields=id,media_type,media_url,permalink,timestamp,caption
  // 2. supabase.from('instagram_posts').upsert(posts, { onConflict: 'ig_id' })
  // 3. 30일 이상 오래된 post는 active=false
  // 4. access_token 60일 만료 — refresh endpoint 호출

  return NextResponse.json({
    ok: true,
    message: "instagram sync stub — P2에서 정식 통합",
    processed: 0,
  });
}
