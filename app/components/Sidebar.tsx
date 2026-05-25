"use client";

import type { Screen } from "./types";

const NAV: Array<{
  screen: Screen;
  icon: string;
  label: string;
  badge?: { count: number; color: "red" | "green" | "gold" };
}> = [
  { screen: "home", icon: "📊", label: "대시보드 홈" },
  {
    screen: "review",
    icon: "🔍",
    label: "검토 화면",
    badge: { count: 7, color: "red" },
  },
  {
    screen: "fixed",
    icon: "✅",
    label: "픽스 모음집",
    badge: { count: 12, color: "green" },
  },
];

type Props = {
  current: Screen;
  onChange: (next: Screen) => void;
};

export default function Sidebar({ current, onChange }: Props) {
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

      {NAV.map((item) => (
        <button
          key={item.screen}
          type="button"
          className={`nav-item ${current === item.screen ? "active" : ""}`}
          onClick={() => onChange(item.screen)}
        >
          <span className="icon">{item.icon}</span> {item.label}
          {item.badge && (
            <span className={`badge ${item.badge.color}`}>
              {item.badge.count}
            </span>
          )}
        </button>
      ))}

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
