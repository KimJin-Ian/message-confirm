export default function Notes() {
  return (
    <aside className="notes">
      <h3>📐 UX RATIONALE</h3>

      <h4>🔓 OPEN ACCESS 원칙</h4>
      <p>로그인·회원가입·권한 분리 일체 없음. URL이 곧 접근 권한.</p>
      <ul>
        <li>이서진 대표·김진 모두 똑같은 화면 봄</li>
        <li>대표님도 메시지 텍스트 직접 수정 가능 (contenteditable)</li>
        <li>이름은 코멘트 작성 시 자유 입력 (드롭다운 또는 직접)</li>
        <li>마지막 선택한 이름은 localStorage에 저장 → 다음에 자동 표시</li>
      </ul>
      <div className="why-box">
        <strong>WHY?</strong> 대표님이 카톡 외 다른 앱 로그인을 번거로워하심.
        &ldquo;URL만 알면 들어와서 자유롭게&rdquo; — 진입 마찰 0.
      </div>
      <div className="warn-box">
        <strong>⚠️ 보안 주의:</strong> URL은 비공개로 유지. 카톡 1:1로만 공유.
        외부 유출 시 누구나 편집 가능 → URL 재발급(slug 변경) 절차 필요.
      </div>

      <h4>🔁 핵심 워크플로우</h4>
      <p>김진(편집자) ↔ 이서진 대표(검토자) 2인 협업. 평균 2~4회 사이클 후 픽스.</p>
      <div className="state-diagram">{`[draft] → [pending]
   ↓ (누구나 검토)
   ├── 코멘트 → [feedback]
   │           ↓ (누구나 수정)
   │      [revised] → 다시 검토
   │
   ├── ✓ 픽스 → [fixed]
   └── 🚫 제외 → [excluded]

※ 로그인 없음 — 모든 액션은 "이름(자유입력)" + 타임스탬프로 기록`}</div>

      <h4>📊 메뉴 단순화</h4>
      <p>핵심 3개 메뉴만. 부가 기능은 메인 화면 안에 통합.</p>
      <ul>
        <li>
          <strong>홈</strong> — 진행 상황 한눈에
        </li>
        <li>
          <strong>검토</strong> — 실제 작업 (편집·코멘트)
        </li>
        <li>
          <strong>픽스 모음</strong> — 결과물 활용
        </li>
      </ul>
      <div className="why-box">
        <strong>WHY?</strong> 자주 안 쓰는 메뉴는 인지 부담만 늘림. 50건 검토만
        신경 쓰면 됨.
      </div>

      <h4>🔍 검토 화면 (핵심)</h4>
      <ul>
        <li>3-column: 원문(왼쪽) · 메시지 버전들(중) · 피드백(오른쪽)</li>
        <li>원문은 변경 불가 — 검증 기준</li>
        <li>
          현재 버전은 <strong>직접 수정 가능</strong> (contenteditable).
          대표님이 바로 고쳐도 됨
        </li>
        <li>v1, v2, v3 모두 보임 — 히스토리 통합 (별도 메뉴 X)</li>
        <li>
          피드백은 채팅 형태 — &ldquo;이서진&rdquo; / &ldquo;김진&rdquo; 등
          이름별 시각 구분
        </li>
        <li>퀵 액션: 톤 조정·단어 빼기·사례 추가·더 짧게</li>
        <li>결정 바: 제외 / 더 수정 요청 / ✓ 픽스 (누구나)</li>
      </ul>
      <div className="why-box">
        <strong>WHY?</strong> 대표님이 직접 텍스트 수정하면 김진이 의도 파악 더
        정확. &ldquo;이거 이렇게 고쳐&rdquo; 코멘트보다 &ldquo;직접 손대신
        결과물&rdquo; 보는 게 빠름.
      </div>

      <h4>👤 작성자 추적 (로그인 없이)</h4>
      <ul>
        <li>코멘트·수정 시 상단 &ldquo;이름&rdquo; 드롭다운 한 번만 선택</li>
        <li>선택값은 브라우저 localStorage에 저장 → 재방문 시 자동</li>
        <li>드롭다운: 익명 · 이서진 · 김진 · 직접 입력</li>
        <li>이름은 강제하지 않음 — &ldquo;익명&rdquo;도 OK</li>
      </ul>

      <h4>🛠️ 기술 스택 (간소화)</h4>
      <ul>
        <li>Next.js 14 (App Router · /app/page.tsx)</li>
        <li>
          Supabase Postgres — 메시지·코멘트·버전 저장{" "}
          <strong>(Auth 사용 X)</strong>
        </li>
        <li>Supabase Realtime — 실시간 동기화</li>
        <li>익명 키(anon key)로 RLS 없이 직접 read/write 허용</li>
        <li>
          URL slug 추측 불가능하게 (예: <code>/m/a7f3-k2x9-bn4q</code>)
        </li>
        <li>Vercel 호스팅 무료</li>
      </ul>

      <h4>📦 DB 스키마 (Auth 없음)</h4>
      <div className="state-diagram">{`messages
 ├ id (uuid)
 ├ customer_tail4
 ├ raw_text
 ├ field (논문/자서전/...)
 ├ status [draft|pending|...]
 ├ current_version
 └ fixed_at

message_versions
 ├ message_id (FK)
 ├ version_num (1, 2, 3)
 ├ body_text
 ├ author_name (free-text · "이서진"/"김진"/익명)
 └ created_at

comments
 ├ message_id (FK)
 ├ author_name (free-text · optional)
 ├ body
 ├ replied_to_version
 └ created_at

★ users 테이블 없음 · auth 테이블 없음
★ author_name은 그냥 텍스트 컬럼 (FK 아님)`}</div>

      <h4>📅 개발 일정 (축소)</h4>
      <ul>
        <li>1주차: DB · 메시지 import · URL slug 생성</li>
        <li>2주차: 검토 화면(3-col) + 코멘트 + contenteditable 저장</li>
        <li>3주차: 버전 관리 · 픽스 모음집 · CSV 내보내기</li>
        <li>4주차: 대시보드 홈 · Realtime · QA</li>
      </ul>

      <h4>💰 비용</h4>
      <ul>
        <li>Vercel + Supabase 무료 플랜</li>
        <li>알림: 카톡 1:1로 직접 전달 (자동화 X)</li>
        <li>월 운영비: 0원</li>
      </ul>
    </aside>
  );
}
