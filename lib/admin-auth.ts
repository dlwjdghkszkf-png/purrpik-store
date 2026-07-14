import { cookies } from "next/headers";
import { createHash } from "crypto";

/**
 * 관리자 인증 — 단일 비밀번호 게이트 (MVP).
 * env `ADMIN_PASSWORD` 설정 시에만 활성. 쿠키에는 원문 대신 sha256 해시 저장(httpOnly).
 *
 * 한계: 단일 비번(다중 관리자·역할 없음). 소셜 로그인 도입 후 owner 이메일 게이트로 승격 가능.
 */
const COOKIE = "padmin";
const MAX_AGE = 60 * 60 * 12; // 12h

function expectedHash(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256").update(pw).digest("hex");
}

/** 관리자 기능 활성 여부 (env 설정됐는지). */
export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** 현재 요청이 인증된 관리자인지. */
export async function isAdmin(): Promise<boolean> {
  const exp = expectedHash();
  if (!exp) return false;
  const store = await cookies();
  return store.get(COOKIE)?.value === exp;
}

/** 입력 비번 검증 (login action 전용). */
export function verifyPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  return Boolean(pw) && input === pw;
}

/** 인증 쿠키 발급 (server action / route handler에서만). */
export async function setAdminCookie(): Promise<void> {
  const exp = expectedHash();
  if (!exp) return;
  const store = await cookies();
  store.set(COOKIE, exp, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

/** 로그아웃. */
export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
