# 메시지 컨펌 협업 시스템 (Message Confirm)

> Next.js 14 (App Router) + TypeScript + Vanilla CSS
> 로그인 없이 누구나 URL만으로 접근·편집·코멘트할 수 있는 메시지 컨펌 협업 도구

## 🔓 핵심 컨셉

- **로그인 없음** — URL이 곧 접근 권한
- **누구나 편집** — 김진·이서진 대표 모두 동일 화면, 메시지 텍스트 직접 수정 가능
- **이름은 선택사항** — 드롭다운(익명/이서진/김진/직접입력), localStorage 자동 저장
- **3개 메뉴** — 대시보드 홈 / 검토 화면 / 픽스 모음집

## 🚀 빠른 시작

```bash
npm install
npm run dev
# → http://localhost:3000

# 프로덕션 빌드
npm run build
npm run start
```

## 📁 구조

```
message-confirm/
├── app/
│   ├── layout.tsx              # 메타데이터 + Pretendard 폰트
│   ├── page.tsx                # 메인 페이지 (Intro→Banner→Workflow→AppMockup)
│   ├── globals.css             # 전체 스타일 (Vanilla CSS · 반응형)
│   └── components/
│       ├── types.ts            # Screen 타입
│       ├── NameContext.tsx     # 작성자 이름 Context + localStorage
│       ├── NameSelector.tsx    # 이름 드롭다운 (재사용)
│       ├── Intro.tsx           # 상단 인트로
│       ├── OpenBanner.tsx      # 오픈 액세스 배너
│       ├── Workflow.tsx        # 4단계 워크플로우
│       ├── AppMockup.tsx       # 사이드바+메인+노트 래퍼 (client)
│       ├── Sidebar.tsx         # 3개 메뉴 + 라이브 태그
│       ├── HomeScreen.tsx      # 대시보드 홈 (KPI/진행률/활동/우선처리)
│       ├── ReviewScreen.tsx    # 3-col 검토 화면 (contenteditable)
│       ├── FixedScreen.tsx     # 픽스 모음집 카드 그리드
│       └── Notes.tsx           # UX Rationale 우측 사이드바
├── public/
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## 🎨 디자인 토큰

| 토큰 | 값 |
|---|---|
| 배경 | `#fafaf7` |
| 네이비 | `#0a1228` / `#1a2547` |
| 골드 | `#c4a661` / `#d4b870` |
| 상태색 | 파랑(검토대기)·주황(피드백옴)·골드(수정완료)·녹색(픽스)·회색(제외) |
| 폰트 | Pretendard (CDN) |

## 📑 화면 구성

1. **인트로** — OPEN ACCESS 태그 + 핵심 가치 4종
2. **오픈 액세스 배너** — "URL이 곧 접근 권한" 명시
3. **4단계 워크플로우** — 등록→피드백→수정→픽스
4. **앱 목업 (3-pane)**
   - 사이드바: 3개 메뉴 + "OPEN LINK · 누구나 접근" 태그
   - 메인: 화면 전환 (홈/검토/픽스)
   - 우측 노트: UX 근거·DB 스키마·개발 일정

### 검토 화면 (핵심)
3-column 레이아웃:
- **원문(왼쪽)** — 변경 불가, 검증 기준
- **메시지 버전(중)** — v3는 `contentEditable`로 직접 수정 가능, v4로 저장
- **피드백(오른쪽)** — 코멘트 채팅 + 작성자 이름 자유 선택

## 🛠 기술 스택 (시연용 목업)

- Next.js 14 App Router
- React 18
- TypeScript 5
- Pretendard 한글 웹폰트 (CDN)
- 상태 관리: React Context + useState (서버 없는 클라이언트 데모)

> 실제 운영 시: Supabase Postgres + Realtime (Auth 미사용 · anon key 직접)

## 🚀 Vercel 배포

1. GitHub 푸시 (예: `KimJin-Ian/message-confirm`)
2. https://vercel.com → New Project → Import → Deploy
3. 약 1~2분 후 배포 URL 발급
4. URL은 카톡 1:1로만 공유 (외부 유출 시 slug 재배포)

## 📌 운영 노트

- **이름 저장**: 마지막 선택한 이름은 브라우저 localStorage에 저장됨
- **메시지 직접 수정**: 검토 화면의 현재 버전(노란 테두리) 박스 클릭 → 직접 텍스트 수정 → 💾 v4로 저장
- **코멘트 작성**: 작성자 드롭다운 + 텍스트 입력 → "코멘트 전송"
- **퀵 피드백**: ✏️ 톤 조정 / 🚫 단어 빼기 / ➕ 사례 추가 / 📏 더 짧게

## ⚠️ 보안 주의

URL은 비공개로 유지. 외부 유출 시 누구나 접근 가능하므로:
- URL은 카톡 1:1로만 공유
- 유출 의심 시 slug 변경 후 새 URL 재배포
- 민감 정보(주민번호·결제정보 등) 입력 금지

## 📞 회사 정보

- 위드에스마케팅
- 작성자: 김진
- 검토자: 이서진 대표
- 작업: 1,840건 문의 DB 기반 재연락 메시지 컨펌

## 📝 라이선스

내부 사용. © 2026 위드에스마케팅.
