/**
 * 상품별 판매 상세페이지 이미지 (자사몰 PDP 본문 = 상품 상세정보).
 * 마켓플레이스용 슬라이스를 자사몰 상품 상세로 그대로 렌더.
 * 키 = products.id. 없는 상품은 기존 구조형 섹션(Layer4) 사용.
 */
export type ProductDetail = {
  hooks: string[]; // 상단 훅 (webp)
  slices: string[]; // 상세 슬라이스 (번호순)
};

export const PRODUCT_DETAIL: Record<string, ProductDetail> = {
  "purrpik-shelter": {
    hooks: [
      "/images/products/shelter-detail/hook1.webp",
      "/images/products/shelter-detail/hook2.webp",
    ],
    slices: Array.from(
      { length: 15 },
      (_, i) =>
        `/images/products/shelter-detail/${String(i + 1).padStart(2, "0")}.jpg`,
    ),
  },
  "purrpik-coolmat": {
    hooks: [],
    slices: Array.from(
      { length: 11 },
      (_, i) =>
        `/images/products/coolmat-detail/${String(i + 1).padStart(2, "0")}.jpg`,
    ),
  },
};

export function getProductDetail(id: string): ProductDetail | null {
  return PRODUCT_DETAIL[id] ?? null;
}
