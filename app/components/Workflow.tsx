const STEPS: Array<{
  who: string;
  what: string;
  det: string;
  highlight?: boolean;
}> = [
  {
    who: "STEP 1 · 누구나",
    what: "메시지 등록",
    det: "원문(raw) + 초안(v1)을 시스템에 업로드",
  },
  {
    who: "STEP 2 · 누구나",
    what: "검토 · 피드백",
    det: "코멘트 작성 시 이름만 자유 입력",
  },
  {
    who: "STEP 3 · 누구나",
    what: "직접 수정 / v2 업로드",
    det: "대표님도 직접 메시지 텍스트 고치기 가능",
  },
  {
    who: "반복",
    what: "v3, v4 …",
    det: "만족할 때까지 반복",
  },
  {
    who: "STEP 4 · 누구나",
    what: "✓ 픽스",
    det: "픽스 모음집 자동 이동 → 발송 준비",
    highlight: true,
  },
];

export default function Workflow() {
  return (
    <div className="workflow">
      <h3>🔁 핵심 워크플로우 — 4단계 사이클 (로그인 없음)</h3>
      <div className="flow-row">
        {STEPS.map((s) => (
          <div
            key={s.what}
            className="flow-step"
            style={
              s.highlight
                ? {
                    background: "var(--green-50)",
                    borderColor: "var(--green-600)",
                  }
                : undefined
            }
          >
            <div
              className="who"
              style={s.highlight ? { color: "var(--green-600)" } : undefined}
            >
              {s.who}
            </div>
            <div className="what">{s.what}</div>
            <div className="det">{s.det}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
