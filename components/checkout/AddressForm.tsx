"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// SSR 비활성 — 카카오 스크립트가 window에 접근.
const DaumPostcode = dynamic(() => import("react-daum-postcode"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20 text-sm text-mute-1">
      주소 검색을 불러오는 중…
    </div>
  ),
});

export interface AddressFormValue {
  name: string;
  phone: string;
  email: string;
  zipcode: string;
  address1: string;
  address2: string;
  memo: string;
  agreePurchase: boolean;
  agreeMarketing: boolean;
}

export const EMPTY_ADDRESS: AddressFormValue = {
  name: "",
  phone: "",
  email: "",
  zipcode: "",
  address1: "",
  address2: "",
  memo: "",
  agreePurchase: false, // 다크패턴 회피: 필수 동의도 사전체크 X
  agreeMarketing: false, // 선택 동의 default unchecked
};

/**
 * 폼이 결제 가능 상태인지 검증.
 * 필수: 이름, 전화번호, 우편번호, 기본주소, 상세주소, 필수약관 동의.
 * 이메일은 선택 (Toss는 이메일 영수증 발송 시만 필수).
 */
export function isFormReady(v: AddressFormValue): boolean {
  return (
    v.name.trim().length > 0 &&
    /^010-?\d{3,4}-?\d{4}$/.test(v.phone.trim()) &&
    v.zipcode.trim().length > 0 &&
    v.address1.trim().length > 0 &&
    v.address2.trim().length > 0 &&
    v.agreePurchase === true
  );
}

interface Props {
  value: AddressFormValue;
  onChange: (next: AddressFormValue) => void;
}

export function AddressForm({ value, onChange }: Props) {
  const [postcodeOpen, setPostcodeOpen] = useState(false);

  const set = <K extends keyof AddressFormValue>(
    key: K,
    v: AddressFormValue[K],
  ) => onChange({ ...value, [key]: v });

  return (
    <section className="rounded-lg border border-line bg-white p-6">
      <h2 className="text-lg font-bold text-ink">배송지 정보</h2>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">
            받는 분 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            value={value.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            휴대폰 번호 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="010-0000-0000"
            value={value.phone}
            onChange={(e) => set("phone", formatPhone(e.target.value))}
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="email">이메일 (선택 · 영수증 발송)</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={value.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label>
            주소 <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="우편번호"
              value={value.zipcode}
              readOnly
              className="flex-1 max-w-[160px] bg-secondary"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setPostcodeOpen(true)}
            >
              <Search className="w-4 h-4 mr-1" />
              주소 검색
            </Button>
          </div>
          <Input
            type="text"
            placeholder="기본 주소"
            value={value.address1}
            readOnly
            className="bg-secondary"
          />
          <Input
            type="text"
            placeholder="상세 주소 (동/호수 등)"
            value={value.address2}
            onChange={(e) => set("address2", e.target.value)}
            autoComplete="address-line2"
            required
          />
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="memo">배송 요청사항 (선택)</Label>
          <textarea
            id="memo"
            rows={2}
            value={value.memo}
            onChange={(e) => set("memo", e.target.value)}
            className="flex w-full rounded-md border border-line bg-white px-3 py-2 text-sm placeholder:text-mute-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="예: 부재 시 경비실에 맡겨주세요"
          />
        </div>
      </div>

      <div className="mt-8 space-y-3 border-t border-line pt-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={value.agreePurchase}
            onCheckedChange={(c) => set("agreePurchase", c === true)}
            className="mt-0.5"
            aria-label="구매조건 및 결제 진행 동의 (필수)"
          />
          <span className="text-sm text-ink leading-relaxed">
            <span className="font-medium">[필수]</span> 구매조건 확인 및 결제
            진행에 동의합니다.{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-mute-1 underline underline-offset-2 hover:text-ink"
            >
              약관 보기
            </a>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={value.agreeMarketing}
            onCheckedChange={(c) => set("agreeMarketing", c === true)}
            className="mt-0.5"
            aria-label="마케팅·광고성 정보 수신 동의 (선택)"
          />
          <span className="text-sm text-ink leading-relaxed">
            <span className="font-medium">[선택]</span> 마케팅 및 광고성 정보
            수신에 동의합니다. (할인·이벤트 안내)
          </span>
        </label>
      </div>

      {/* 카카오/Daum 우편번호 모달 */}
      <Dialog open={postcodeOpen} onOpenChange={setPostcodeOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-line">
            <DialogTitle>주소 검색</DialogTitle>
          </DialogHeader>
          <div className="h-[450px]">
            <DaumPostcode
              onComplete={(data) => {
                onChange({
                  ...value,
                  zipcode: data.zonecode,
                  address1: data.roadAddress || data.address,
                });
                setPostcodeOpen(false);
              }}
              autoClose
              style={{ height: "100%" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/**
 * 010-0000-0000 형식 자동 포맷터.
 * 숫자만 추출 → 11자리까지 - 삽입.
 */
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}
