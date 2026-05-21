/**
 * 솔라피 v4 SMS/알림톡 API wrapper.
 * Stage 9 — 결제 완료 알림톡.
 *
 * 인증: HMAC-SHA256 (apiKey + secret + date + salt → signature).
 *   `Authorization: HMAC-SHA256 apiKey=<key>, date=<iso>, salt=<rand>, signature=<hex>`
 *
 * 발송 실패 시 결제 자체는 성공 — 호출 측에서 alimtalk_sent_at=null + attempts++ 처리 후 Cron 재시도.
 */

import { createHmac, randomBytes } from "node:crypto";

const SOLAPI_BASE = "https://api.solapi.com";

export interface AlimtalkRequest {
  /** 010-... 또는 01000000000. 내부에서 하이픈 제거 */
  to: string;
  /** 카카오 알림톡 템플릿 ID (솔라피 대시보드에서 발급) */
  templateId: string;
  /** `{#{변수명}}` 치환값 */
  variables: Record<string, string>;
}

export interface AlimtalkResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function buildAuthHeader(apiKey: string, apiSecret: string): string {
  const date = new Date().toISOString();
  const salt = randomBytes(16).toString("hex");
  const signature = createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");
  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

/**
 * 알림톡 발송 (실패 시 SMS fallback — `disableSms=false`).
 * env 미설정이면 graceful — `success:false, error:'SOLAPI_ENV_MISSING'`.
 */
export async function sendAlimtalk(
  req: AlimtalkRequest,
): Promise<AlimtalkResult> {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const senderPhone = process.env.SOLAPI_SENDER_PHONE;
  const pfId = process.env.SOLAPI_KAKAO_PFID;

  if (!apiKey || !apiSecret || !senderPhone || !pfId) {
    return { success: false, error: "SOLAPI_ENV_MISSING" };
  }

  const body = {
    message: {
      to: req.to.replace(/-/g, ""),
      from: senderPhone.replace(/-/g, ""),
      type: "ATA", // 알림톡
      kakaoOptions: {
        pfId,
        templateId: req.templateId,
        variables: req.variables,
        disableSms: false, // 알림톡 실패 시 SMS fallback
      },
    },
  };

  try {
    const res = await fetch(`${SOLAPI_BASE}/messages/v4/send`, {
      method: "POST",
      headers: {
        Authorization: buildAuthHeader(apiKey, apiSecret),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        success: false,
        error: `SOLAPI_HTTP_${res.status}: ${text.slice(0, 200)}`,
      };
    }

    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
      groupId?: string;
    };
    return {
      success: true,
      messageId: data.messageId ?? data.groupId,
    };
  } catch (e) {
    return {
      success: false,
      error: `SOLAPI_EXCEPTION: ${(e as Error).message}`,
    };
  }
}
