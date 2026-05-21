/**
 * Stage 14 — Next.js server-side instrumentation entry.
 *
 * Sentry server/edge init을 런타임에 맞춰 import.
 * @sentry/nextjs 권장 패턴 (Next 16 호환).
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Sentry server-side error capture hook (Next 15+ App Router).
export { captureRequestError as onRequestError } from "@sentry/nextjs";
