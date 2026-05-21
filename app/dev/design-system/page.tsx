/**
 * 디자인 시스템 미리보기 (개발 참고용)
 * — 라우트: /dev/design-system
 * — Stage 14: prod 노출 차단 (NODE_ENV === 'production' → 404).
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const metadata: Metadata = {
  title: "디자인 시스템 — 푸르픽",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "ink (텍스트)", hex: "#0a0a0a", className: "bg-ink", text: "text-white" },
  { name: "mute-1", hex: "#525252", className: "bg-mute-1", text: "text-white" },
  { name: "mute-2", hex: "#737373", className: "bg-mute-2", text: "text-white" },
  { name: "line", hex: "#e5e5e5", className: "bg-line", text: "text-ink" },
  { name: "bg (베이스)", hex: "#ffffff", className: "bg-bg border border-line", text: "text-ink" },
  {
    name: "brand-mustard",
    hex: "#c17a1f",
    className: "bg-brand-mustard",
    text: "text-white",
  },
  {
    name: "brand-mustard-deep",
    hex: "#8a4e0a",
    className: "bg-brand-mustard-deep",
    text: "text-white",
  },
];

export default function DesignSystemPage() {
  // Stage 14: prod에서는 노출 차단.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }
  return (
    <div className="container-page py-16 space-y-16">
      <header className="space-y-2">
        <p className="text-small uppercase tracking-widest text-mute-1">
          Dev Reference
        </p>
        <h1>푸르픽 디자인 시스템</h1>
        <p className="text-mute-1 max-w-2xl">
          Wild One 톤 — 화이트 + 잉크 블랙 + 머스터드 단일 액센트. 모든 페이지는
          이 토큰만 사용합니다. (Stage 1 산출물)
        </p>
      </header>

      <Separator />

      {/* 컬러 */}
      <section className="space-y-6">
        <h2>1. 컬러 토큰</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {COLORS.map((c) => (
            <div key={c.name} className="space-y-2">
              <div
                className={`${c.className} ${c.text} h-24 rounded-md flex items-end p-2 text-small font-medium`}
              >
                {c.hex}
              </div>
              <p className="text-small text-mute-1">{c.name}</p>
            </div>
          ))}
        </div>
        <p className="text-small text-mute-2">
          머스터드는 CTA · 배지 · 강조 텍스트에만 사용합니다. 본문/카드 배경
          금지.
        </p>
      </section>

      <Separator />

      {/* 타이포 */}
      <section className="space-y-6">
        <h2>2. 타이포그래피 (Pretendard Variable)</h2>
        <div className="space-y-4">
          <div>
            <h1>H1 — 길고양이 보호 셸터</h1>
            <p className="text-small text-mute-2 mt-1">
              clamp(32px → 48px) · weight 700 · line 1.15
            </p>
          </div>
          <div>
            <h2>H2 — 4중 구조 단열재</h2>
            <p className="text-small text-mute-2 mt-1">
              clamp(24px → 32px) · weight 700 · line 1.2
            </p>
          </div>
          <div>
            <h3>H3 — 사이즈별 추천</h3>
            <p className="text-small text-mute-2 mt-1">
              clamp(20px → 24px) · weight 600 · line 1.3
            </p>
          </div>
          <div>
            <p>
              본문 — 옥스포드 600D 방수 외피와 AL Foil 단열재로 영하 5도까지
              내부 온도를 보호합니다. 16px · weight 400 · line 1.6
            </p>
          </div>
          <div>
            <small className="block text-mute-1">
              스몰 — 배송 안내, 캡션, 푸터 텍스트에 사용 · 14px · line 1.5
            </small>
          </div>
        </div>
      </section>

      <Separator />

      {/* 버튼 */}
      <section className="space-y-6">
        <h2>3. 버튼</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-small text-mute-1">Default (잉크 블랙) — 보조 액션</p>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">작은 버튼</Button>
              <Button>장바구니 담기</Button>
              <Button size="lg">상세 보기</Button>
              <Button disabled>비활성</Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-small text-mute-1">
              Mustard — CTA 전용 (구매 · 결제 · 가입)
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="mustard" size="sm">
                구매하기
              </Button>
              <Button variant="mustard">바로 결제</Button>
              <Button variant="mustard" size="lg">
                지금 주문하기
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-small text-mute-1">Outline — 보조 / 토글</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                M 사이즈
              </Button>
              <Button variant="outline">L 사이즈</Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-small text-mute-1">Ghost / Link</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost">취소</Button>
              <Button variant="link">자세히 보기</Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* 인풋 */}
      <section className="space-y-6">
        <h2>4. 폼 컨트롤</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
          <div className="space-y-2">
            <Label htmlFor="email-demo">이메일</Label>
            <Input id="email-demo" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone-demo">휴대폰</Label>
            <Input id="phone-demo" type="tel" placeholder="010-0000-0000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="disabled-demo">비활성</Label>
            <Input id="disabled-demo" placeholder="입력 불가" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invalid-demo">에러 상태</Label>
            <Input id="invalid-demo" placeholder="잘못된 값" aria-invalid />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="agree-demo" />
            <Label htmlFor="agree-demo" className="text-small font-normal">
              마케팅 수신에 동의합니다
            </Label>
          </div>
          <RadioGroup defaultValue="m" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem id="size-m" value="m" />
              <Label htmlFor="size-m" className="text-small font-normal">
                M
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="size-l" value="l" />
              <Label htmlFor="size-l" className="text-small font-normal">
                L
              </Label>
            </div>
          </RadioGroup>
        </div>
      </section>

      <Separator />

      {/* 카드 + 배지 */}
      <section className="space-y-6">
        <h2>5. 카드 · 배지</h2>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>BASIC M</CardTitle>
                <Badge>베스트셀러</Badge>
              </div>
              <CardDescription>
                길냥이 1마리 · 4중 단열 · 29,900원
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="mustard" className="w-full">
                구매하기
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>ALL-IN-ONE L</CardTitle>
                <Badge className="bg-brand-mustard text-white">
                  실구매자 추천
                </Badge>
              </div>
              <CardDescription>
                다묘 · 출입 2단계 · 44,900원
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="mustard" className="w-full">
                구매하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* 컨테이너 */}
      <section className="space-y-4">
        <h2>6. 컨테이너</h2>
        <p className="text-small text-mute-1">
          <code>.container-page</code> = <code>max-w-7xl mx-auto px-4
          md:px-6 lg:px-8</code> — 모든 페이지 섹션의 가로 폭 기준.
        </p>
        <div className="bg-line/40 border border-line rounded-md p-6 text-small text-mute-1">
          이 박스가 .container-page 안에 있습니다. 좌우 패딩이 반응형으로
          16/24/32px로 변하고, 최대폭 1280px에서 가운데 정렬됩니다.
        </div>
      </section>
    </div>
  );
}
