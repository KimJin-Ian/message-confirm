"use client";

import type { Screen } from "./types";
import type { KpiCounts } from "@/lib/api";

type Props = {
  current: Screen;
  onChange: (next: Screen) => void;
  counts: KpiCounts | null;
};

export default function Sidebar({ current, onChange, counts }: Props) {
  // 검토가 필요한 건수 = pending + revised + feedback (대표가 보거나 김진이 수정할 것)
  const reviewCount = counts
    ? counts.pending + counts.revised + counts.feedback
    : null;
  const fixedCount = counts ? counts.fixed : null;
  const excludedCount = counts ? counts.excluded : null;

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">
          <div className="logo-mark">M</div>
          <div className="logo-text">
            메시지 컨펌
            <small>OPEN · NO LOGIN</small>
          </div>
        </div>
      </div>

      <div className="sidebar-section">메인 메뉴</div>

      <NavItem
        active={current === "home"}
        icon="📊"
        label="대시보드 홈"
        onClick={() => onChange("home")}
      />
      <NavItem
        active={current === "review"}
        icon="🔍"
        label="검토 화면"
        badge={reviewCount}
        badgeColor="red"
        onClick={() => onChange("review")}
      />
      <NavItem
        active={current === "fixed"}
        icon="✅"
        label="픽스 모음집"
        badge={fixedCount}
        badgeColor="green"
        onClick={() => onChange("fixed")}
      />
      <NavItem
        active={current === "excluded"}
        icon="🚫"
        label="제외 케이스"
        badge={excludedCount}
        badgeColor="gold"
        onClick={() => onChange("excluded")}
      />

      <div className="sidebar-footer">
        <div className="open-tag">
          <span className="dot-live"></span>
          OPEN LINK · 누구나 접근
        </div>
        <div className="url-hint">
          URL을 아는 사람 모두 편집 가능.
          <br />
          이름은 자유 입력 (선택).
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  active,
  icon,
  label,
  badge,
  badgeColor,
  onClick,
}: {
  active: boolean;
  icon: string;
  label: string;
  badge?: number | null;
  badgeColor?: "red" | "green" | "gold";
  onClick: () => void;
}) {
  // 0이거나 null이면 배지 안 보임
  const showBadge = typeof badge === "number" && badge > 0;
  return (
    <button
      type="button"
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="icon">{icon}</span> {label}
      {showBadge && (
        <span className={`badge ${badgeColor ?? ""}`}>{badge}</span>
      )}
    </button>
  );
}
