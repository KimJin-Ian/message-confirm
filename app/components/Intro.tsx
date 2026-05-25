export default function Intro() {
  return (
    <section className="intro">
      <div className="tag">UI / UX 기획서 · OPEN ACCESS</div>
      <h1>
        메시지 컨펌 <span>협업 시스템</span>
      </h1>
      <p>
        누구나 URL만 알면 들어와서 자유롭게 편집·코멘트·픽스. 로그인 없음.
        <br />
        김진이 원문+초안 올림 → 이서진 대표가 검토·피드백 → 김진 수정 → 픽스
        → 모음집 자동 누적.
      </p>
      <div className="pill-row">
        <span>🔓 로그인 없음 (Open Link)</span>
        <span>누구나 편집 가능</span>
        <span>실시간 동기화</span>
        <span>이름은 선택사항</span>
      </div>
    </section>
  );
}
