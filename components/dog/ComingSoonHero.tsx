"use client";

/**
 * Stage 17 v3 — /dog placeholder hero + 뉴스레터 가입.
 *
 * 강아지 라인업은 아직 비어 있으므로 출시 알림용 뉴스레터 (source='dog-page') + 인스타 + /cat 링크.
 * 같은 `/api/newsletter/subscribe` 사용.
 */

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dog as DogIcon, ArrowRight } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

type SubscribeStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function ComingSoonHero() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<SubscribeStatus>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setStatus({
        kind: "error",
        message: "마케팅 정보 수신에 동의해주세요.",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "dog-page", consent: agreed }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        const msg =
          data.error === "invalid_email"
            ? "올바른 이메일 주소를 입력해주세요."
            : data.error === "consent_required"
              ? "마케팅 정보 수신에 동의해주세요."
              : "문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
        setStatus({ kind: "error", message: msg });
        return;
      }

      if (data.alreadySubscribed) {
        setStatus({ kind: "success", message: "이미 가입되어 있습니다." });
      } else {
        setStatus({
          kind: "success",
          message: "가입 완료! 첫 출시 소식을 가장 먼저 보내드릴게요.",
        });
      }
      setEmail("");
      setAgreed(false);
    } catch {
      setStatus({
        kind: "error",
        message: "문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
  }

  const loading = status.kind === "loading";

  return (
    <section className="container-page py-16 md:py-24">
      {/* Hero */}
      <div className="min-h-[60vh] md:min-h-[70vh] flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
        <div
          className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-secondary flex items-center justify-center mb-8"
          aria-hidden="true"
        >
          <DogIcon className="w-14 h-14 md:w-16 md:h-16 text-brand-mustard" strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-ink tracking-tight">
          강아지 신상품 준비 중
        </h1>
        <p className="mt-4 md:mt-6 text-base md:text-lg text-mute-1 leading-relaxed">
          푸르픽이 곧 강아지 라인업을 선보입니다.
          <br className="hidden md:block" />
          출시되는 즉시 가장 먼저 알려드릴게요.
        </p>
      </div>

      {/* 뉴스레터 강조 박스 */}
      <div className="mt-8 md:mt-12 max-w-2xl mx-auto rounded-2xl border border-line bg-white p-6 md:p-10">
        <h2 className="text-xl md:text-2xl font-bold text-ink">출시 알림 받기</h2>
        <p className="mt-2 text-sm md:text-base text-mute-1">
          이메일을 남기시면 강아지 라인업 출시·사전 예약·한정 할인을 우선 안내드립니다.
        </p>
        <form
          action="/api/newsletter/subscribe"
          method="post"
          onSubmit={handleSubmit}
          className="mt-6 space-y-3"
          noValidate
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일 주소"
              className="flex-1 h-12"
              aria-label="이메일 주소"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="h-12 px-6"
              disabled={loading || !agreed || !email}
            >
              {loading ? "가입 중…" : "알림 받기"}
            </Button>
          </div>
          <label className="flex items-center gap-2 text-xs text-mute-1 cursor-pointer">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              aria-label="마케팅 수신 동의 (필수)"
              disabled={loading}
            />
            마케팅 정보 수신에 동의합니다 (필수)
          </label>
          {status.kind === "success" && (
            <p
              role="status"
              className="text-xs text-emerald-600"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
          {status.kind === "error" && (
            <p
              role="alert"
              className="text-xs text-red-600"
              aria-live="assertive"
            >
              {status.message}
            </p>
          )}
        </form>
      </div>

      {/* 인스타 + cat 링크 */}
      <div className="mt-8 md:mt-12 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 sm:gap-4">
        <a
          href="https://instagram.com/purrpik"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-line bg-white text-sm font-medium text-ink hover:border-ink transition-colors"
        >
          <InstagramIcon className="w-4 h-4" />
          인스타그램 팔로우
        </a>
        <Link
          href="/cat"
          className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-md border border-line bg-white text-sm font-medium text-ink hover:border-ink transition-colors"
        >
          고양이 제품 보기
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
