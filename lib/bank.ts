/**
 * 무통장입금 계좌 정보 (공개 표시용 — 비밀 아님).
 * ⚠️ 실제 값은 사용자 계좌로 교체해야 함. placeholder면 BANK_CONFIGURED=false.
 */
export const BANK_INFO = {
  bank: "____은행", // TODO: 실제 은행명
  account: "0000000000000", // TODO: 실제 계좌번호 (숫자만)
  holder: "제이에이치컴퍼니", // 예금주
};

/** placeholder 여부 — 미설정 시 무통장 안내에 '고객센터 문의' 폴백. */
export const BANK_CONFIGURED = !BANK_INFO.account.startsWith("0000");

/** 입금 마감 안내 (주문 후 N일). */
export const BANK_DEADLINE_DAYS = 3;
