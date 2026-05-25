"use client";

type Card = {
  id: string;
  field: string;
  title: string;
  preview: string;
  ago: string;
  version: string;
};

const CARDS: Card[] = [
  {
    id: "4544",
    field: "자서전",
    title: "오래 전이지만 자서전 문의 주셨던 분이시죠?",
    preview:
      "그때 말씀하셨던 이야기를 책으로 남기는 계획, 저는 아직 기억에 남아 있어요. 시간이 지날수록 글이 어려워지는 게 아니라 기억이 흐려져서...",
    ago: "23분 전 픽스",
    version: "v3",
  },
  {
    id: "3131",
    field: "논문",
    title: "박사논문 재문의 · 두 번 연락 주신 분",
    preview:
      "박사 1학기 때 구조 잡아두면 마지막이 훨씬 수월하거든요. 통과될 때까지 1:1 피드백 가고, 표절 검수팀이 따로 있어서...",
    ago: "1시간 전 픽스",
    version: "v2",
  },
  {
    id: "8543",
    field: "논문",
    title: "페이지당 2만원 생각하셨던 분",
    preview:
      "2022년 4월쯤 논문 문의 주셨던 분이시죠? 그때 페이지당 2만원 생각하셨던 게 기억나서요. 지금은 패키지가 좀 더...",
    ago: "2시간 전 픽스",
    version: "v2",
  },
  {
    id: "0271",
    field: "정치",
    title: "천안시장 자서전 패키지 · 타이밍 강조",
    preview:
      "출판기념회·선거·임기 일정 고려하시면 지금이 마지노선이에요. 천안시장 자서전·서초구의원 자서전 등 공직자...",
    ago: "어제 픽스",
    version: "v3",
  },
  {
    id: "2912",
    field: "논문",
    title: "표준 논문컨설팅",
    preview:
      "서울대·해외 박사급 컨설턴트가 1:1로 통과될 때까지 가고, 표절 검수팀이 따로 있어서 저작권 리스크도...",
    ago: "어제 픽스",
    version: "v1",
  },
  {
    id: "8268",
    field: "기업",
    title: "기업 도서 · 대전신용보증재단 사례",
    preview:
      "기업 도서는 광고가 아니라 신뢰 자산이 되거든요. 한 번 만들면 검색 노출 + 임직원 활용 + 고객 신뢰까지...",
    ago: "2일 전 픽스",
    version: "v2",
  },
];

export default function FixedScreen() {
  return (
    <div className="screen active" id="screen-fixed">
      <div className="page-head">
        <div>
          <h2>픽스 모음집 (12건)</h2>
          <div className="sub">컨펌 완료 · 발송 준비 OK</div>
        </div>
        <div className="actions">
          <button className="btn" type="button">
            📋 일괄 복사
          </button>
          <button className="btn primary" type="button">
            📤 CSV 내보내기
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="btn" defaultValue="all">
              <option value="all">분야 전체 (12)</option>
              <option>논문 (7)</option>
              <option>자서전 (2)</option>
              <option>자비출판 (2)</option>
              <option>기업 (1)</option>
            </select>
            <select className="btn" defaultValue="all">
              <option value="all">점수 전체</option>
              <option>100점</option>
              <option>90~99</option>
              <option>80~89</option>
            </select>
            <select className="btn" defaultValue="recent">
              <option value="recent">최근 픽스순</option>
              <option>오래된 순</option>
              <option>점수 높은 순</option>
            </select>
            <input
              type="text"
              className="btn"
              placeholder="🔎 끝4자리·키워드 검색"
              style={{ flex: 1, minWidth: 200, cursor: "text" }}
            />
          </div>
        </div>
      </div>

      <div className="fixed-grid">
        {CARDS.map((c) => (
          <div key={c.id} className="fixed-card">
            <div className="top">
              <span className="id">{c.id}</span>
              <span className="field-pill">{c.field}</span>
            </div>
            <h4>{c.title}</h4>
            <div className="preview">{c.preview}</div>
            <div className="foot">
              <span>
                {c.ago} · {c.version}
              </span>
              <span className="copy-btn">📋 복사</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
