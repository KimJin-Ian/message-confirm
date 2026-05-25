# Supabase 설정 가이드 (3단계, 약 10분)

## 📋 사전 준비
- Supabase 프로젝트: https://icftwzoysfxgxcozfuwj.supabase.co
- 로컬 프로젝트: `C:\Users\kimjin\Desktop\message-confirm`

---

## 1️⃣ DB 스키마 적용 (2분)

1. Supabase 대시보드 접속 → 좌측 **SQL Editor** 클릭
2. `+ New query` 클릭
3. `supabase/schema.sql` 파일 전체를 복사해서 붙여넣기
4. 우측 하단 **Run** (또는 Ctrl/Cmd+Enter)
5. 성공 메시지 확인 — 3개 테이블 생성됨:
   - `messages`
   - `message_versions`
   - `comments`

> 검증 쿼리:
> ```sql
> SELECT table_name FROM information_schema.tables
> WHERE table_schema='public';
> ```

---

## 2️⃣ Top50 v5 데이터 import (1분)

1. SQL Editor에서 새 query 열기
2. `supabase/seed.sql` 파일 전체를 붙여넣기 (50건 메시지 + v1 본문)
3. **Run**
4. 결과:
   - `messages_count`: 50
   - `versions_count`: 50
   - status 분포: 50건 모두 `pending`

> ⚠️ `seed.sql` 맨 위에 `TRUNCATE` 가 있어서 기존 데이터가 비워집니다.
> 처음 import 시에만 사용. 운영 중에는 절대 다시 실행하지 마세요.

---

## 3️⃣ anon key 확인 → 환경변수 등록 (3분)

### A. Supabase에서 anon key 복사

1. Supabase 대시보드 → 좌측 **Project Settings** (톱니바퀴 아이콘)
2. **API** 탭 클릭
3. **Project API keys** 섹션에서 `anon / public` 키 복사
   - `eyJhbGc...` 로 시작하는 긴 토큰

### B. 로컬 개발 (.env.local)

`message-confirm/` 폴더에 `.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://icftwzoysfxgxcozfuwj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (복사한 anon key 붙여넣기)
```

그리고 dev 서버 실행:
```bash
cd C:\Users\kimjin\Desktop\message-confirm
npm run dev
```
→ http://localhost:3000 에서 실제 데이터 확인.

### C. Vercel 배포 환경변수

1. Vercel → 프로젝트 `message-confirm` → **Settings** → **Environment Variables**
2. 두 개 추가:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://icftwzoysfxgxcozfuwj.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGc...`
3. Environment: **Production / Preview / Development** 모두 체크
4. Save → 자동 재배포

---

## 4️⃣ Realtime 활성화 확인 (선택)

`schema.sql` 마지막에 다음이 들어있어서 자동 적용됩니다:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_versions;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
```

확인하려면:
- Supabase 대시보드 → **Database** → **Replication**
- `supabase_realtime` publication에 3개 테이블이 모두 포함돼 있어야 함

---

## ✅ 동작 확인

http://localhost:3000 (또는 Vercel URL) 접속:

1. **홈** — KPI: 전체 50 / 픽스 0 / 미검토 50 표시 ✓
2. **우선 처리 표** — Top10 정도가 list로 표시
3. **검토** — 메시지 클릭하면 원문 + v1 메시지 + 코멘트(없음) 표시
4. **수정 → 저장** — "💾 새 버전(v2)으로 저장" 누르면 DB에 새 row 생성
5. **코멘트 작성** — 입력 후 전송 시 DB 저장, 다른 브라우저에서 실시간 반영
6. **✓ 픽스** — 상태가 `fixed`로 바뀌고 픽스 모음집으로 이동
7. **픽스 모음집** — fixed 상태 메시지 카드로 표시, CSV 내보내기 가능

---

## 🔒 보안 노트

- **로그인 없음** — URL만 알면 누구나 편집 가능. 카톡 1:1로만 URL 공유.
- **RLS 비활성** — anon key로 직접 read/write. 외부 노출 시 새 프로젝트 발급 후 URL 변경 필요.
- **민감 정보 X** — 고객 본명·전화번호 전체는 절대 DB에 넣지 마세요. 현재 끝4자리만 저장.

---

## 🛠️ 문제 해결

| 증상 | 원인 / 해결 |
|---|---|
| 홈 화면이 모두 0 또는 "로딩 중" 무한 | seed.sql을 안 돌림 → 2단계 실행 |
| "데이터 로드 실패" 빨간 박스 | anon key 누락 → .env.local 또는 Vercel 환경변수 확인 |
| Realtime 동기화가 안 됨 | Replication에 3개 테이블 포함 확인 (4단계) |
| 코멘트 보내도 다른 브라우저에 안 보임 | 새로고침 버튼 한 번 → Realtime 안되면 publication 확인 |
| `permission denied for table messages` | RLS가 켜진 상태 — schema.sql 재실행 (RLS 없는 상태로 생성) |

---

## 📦 파일 구조

```
message-confirm/
├── supabase/
│   ├── schema.sql       ← 1단계 (테이블·인덱스·트리거·publication)
│   ├── seed.sql         ← 2단계 (Top50 50건 데이터)
│   └── SETUP.md         ← 이 문서
├── lib/
│   ├── supabase.ts      ← Supabase 클라이언트
│   └── api.ts           ← fetch/insert/update 함수
├── .env.example         ← 환경변수 템플릿
└── .env.local           ← (직접 생성) 실제 anon key
```
