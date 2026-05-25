import Intro from "./components/Intro";
import OpenBanner from "./components/OpenBanner";
import Workflow from "./components/Workflow";
import AppMockup from "./components/AppMockup";

export default function Page() {
  return (
    <>
      <Intro />
      <OpenBanner />
      <Workflow />
      <AppMockup />
      <div className="bottom">
        ⓒ 2026 위드에스마케팅 · 메시지 컨펌 시스템 v2.0 (Open Access · No Login)
        <br />
        → 사이드바 메뉴 클릭하면 화면이 전환됩니다. 메시지 텍스트는 직접
        수정해서 v4로 저장할 수 있습니다.
      </div>
    </>
  );
}
