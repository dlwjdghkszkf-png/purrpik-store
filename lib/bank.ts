/**
 * 무통장입금 계좌 정보 (공개 표시용 — 비밀 아님).
 * ⚠️ 실제 값은 사용자 계좌로 교체해야 함. placeholder면 BANK_CONFIGURED=false.
 */
export const BANK_INFO = {
  bank: "KB국민",
  account: "933502-00-332849",
  holder: "이정환",
};

/** placeholder 여부 — 미설정 시 무통장 안내에 '고객센터 문의' 폴백. */
export const BANK_CONFIGURED = !BANK_INFO.account.startsWith("0000");

/** 입금 마감 안내 (주문 후 N일). */
export const BANK_DEADLINE_DAYS = 3;
