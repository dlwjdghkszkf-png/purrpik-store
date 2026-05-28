// 임시 진단 API — Stage 18 PDP 404 원인 추적용. 진단 후 삭제.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 40),
    },
  };

  try {
    const supabase = await createClient();

    // 1) all products (RLS 확인)
    const { data: allActive, error: e1 } = await supabase
      .from("products")
      .select("id, name, is_master, active");
    result.allActive = { data: allActive, error: e1?.message };

    // 2) master only
    const { data: masterFetch, error: e2 } = await supabase
      .from("products")
      .select("*")
      .eq("id", "purrpik-shelter")
      .eq("active", true)
      .eq("is_master", true)
      .limit(1);
    result.masterFetch = {
      count: masterFetch?.length ?? 0,
      hasVariants: !!masterFetch?.[0]?.variants,
      variantsType: typeof masterFetch?.[0]?.variants,
      error: e2?.message,
    };

    // 3) master row sample
    if (masterFetch?.[0]) {
      const m = masterFetch[0];
      result.masterRow = {
        id: m.id,
        name: m.name,
        is_master: m.is_master,
        active: m.active,
        price_min: m.price_min,
        price_max: m.price_max,
        edition: m.edition,
        variantsKeys: m.variants ? Object.keys(m.variants as object) : null,
      };
    }
  } catch (e) {
    result.exception = (e as Error).message;
  }

  return NextResponse.json(result, { status: 200 });
}
