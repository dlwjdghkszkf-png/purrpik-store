# 카카오톡 채널 연결 가이드

Stage 19 — `KakaoChannelButton` 우하단 floating 버튼 동작용.

## 1. 카카오 비즈채널 개설

1. https://center-pf.kakao.com 접속 → 카카오 계정 로그인
2. "새 채널 만들기" → 채널 이름 `푸르픽`, 검색용 ID `purrpik` (희망하는 ID)
3. 프로필 이미지 + 소개글 입력 (브랜드 가이드 따라)
4. 채널 검색 허용·홈 공개 설정 ON

## 2. 채널 URL 확보

개설 완료 시 URL이 부여됨 (`https://pf.kakao.com/_xxxxx` 형식).
관리자 → 채널 홈 우상단 "공유 URL"에서 복사.

## 3. env 등록

### 로컬 (`.env.local`)
```
NEXT_PUBLIC_KAKAO_CHANNEL_URL=https://pf.kakao.com/_xxxxx
```

### Vercel
프로젝트 → Settings → Environment Variables
- `NEXT_PUBLIC_KAKAO_CHANNEL_URL` 추가 (Production + Preview + Development 모두)
- 저장 후 자동 재배포 (또는 Deployments → Redeploy)

## 4. 검증

- 페이지 진입 3초 후 우하단 노란 카카오 버튼 fade-in
- 클릭 → 새 탭에서 카카오톡 채널 페이지 열림
- 모바일에서도 동일하게 표시

## 5. (P2) 알림톡 연계

솔라피 알림톡 (`SOLAPI_KAKAO_PFID`)과 동일한 채널 PFID 사용 권장.
관리자 → 채널 설정 → 비즈니스 인증 마치면 알림톡 발송 가능.
