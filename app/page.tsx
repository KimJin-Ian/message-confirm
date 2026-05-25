import AppMockup from "./components/AppMockup";

// 이 페이지는 클라이언트 상호작용 위주라 prerender(SSG) 단계를 건너뜀.
// 빌드 시점에 페이지 평가 → Supabase 호출 시도 → 환경변수 없으면 실패 패턴 차단.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function Page() {
  return <AppMockup />;
}
