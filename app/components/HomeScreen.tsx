"use client";

import { useEffect, useState } from "react";
import NameSelector from "./NameSelector";
import {
  fetchAllMessages,
  fetchKpiCounts,
  subscribeToMessages,
  type KpiCounts,
} from "@/lib/api";
import type { Message } from "@/lib/supabase";

type Props = {
  onSelectMessage: (messageId: string) => void;
};

export default function HomeScreen({ onSelectMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [kpi, setKpi] = useState<KpiCounts>({
    total: 0,
    fixed: 0,
    revised: 0,
    feedback: 0,
    pending: 0,
    excluded: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [msgs, counts] = await Promise.all([
        fetchAllMessages(),
        fetchKpiCounts(),
      ]);
      setMessages(msgs);
      setKpi(counts);
      setError(null);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "데이터 로드 실패";
      setError(m);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = subscribeToMessages(load);
    return unsub;
  }, []);

  const pct = (n: number) =>
    kpi.total ? Math.round((n / kpi.total) * 100) : 0;

  const priority = messages
    .filter((m) => m.status === "pending" || m.status === "revised" || m.status === "feedback")
    .slice(0, 8);

  return (
    <div className="screen active" id="screen-home">
      <div className="page-head">
        <div>
          <h2>안녕하세요 👋</h2>
          <div className="sub">
            메시지 컨펌 작업 — 현재 진행 현황 · 로그인 없이 자유 편집
          </div>
        </div>
        <div className="actions">
          <NameSelector />
          <button className="btn" type="button" onClick={load}>
            🔄 새로고침
          </button>
          <button
            className="btn primary"
            type="button"
            onClick={() => {
              const first = priority[0];
              if (first) onSelectMessage(first.id);
            }}
            disabled={priority.length === 0}
          >
            → 검토 시작
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "var(--red-50)",
            border: "1px solid var(--red-600)",
            color: "var(--red-600)",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          ⚠ {error}
          <div style={{ fontSize: 11, color: "var(--text-500)", marginTop: 4 }}>
            .env.local 또는 Vercel 환경변수에 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정됐는지 확인하세요.
          </div>
        </div>
      )}

      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi featured">
          <div className="lbl">전체 메시지</div>
          <div className="num">{loading ? "—" : kpi.total}</div>
          <div className="delta">Top50 우선순위</div>
        </div>
        <div className="kpi">
          <div className="lbl">픽스 완료 ✓</div>
          <div className="num" style={{ color: "var(--green-600)" }}>
            {loading ? "—" : kpi.fixed}
          </div>
          <div className="delta">{pct(kpi.fixed)}%</div>
        </div>
        <div className="kpi">
          <div className="lbl">수정 완료</div>
          <div className="num" style={{ color: "var(--gold-600)" }}>
            {loading ? "—" : kpi.revised}
          </div>
          <div className="delta">확인 대기</div>
        </div>
        <div className="kpi">
          <div className="lbl">피드백 옴</div>
          <div className="num" style={{ color: "var(--orange-600)" }}>
            {loading ? "—" : kpi.feedback}
          </div>
          <div className="delta">재수정 대기</div>
        </div>
        <div className="kpi">
          <div className="lbl">미검토</div>
          <div className="num" style={{ color: "var(--blue-600)" }}>
            {loading ? "—" : kpi.pending}
          </div>
          <div className="delta">검토 대기</div>
        </div>
      </div>

      {/* 진행률 */}
      <div className="progress-overall">
        <div className="progress-head">
          <h3>📈 전체 진행률</h3>
          <div className="pct">
            {pct(kpi.fixed)}%{" "}
            <span style={{ fontSize: "13px", color: "var(--text-500)", fontWeight: 400 }}>
              / 100%
            </span>
          </div>
        </div>
        <div className="progress-bar">
          <div
            className="seg fixed"
            style={{ width: `${pct(kpi.fixed)}%` }}
            title={`픽스 ${kpi.fixed}`}
          />
          <div
            className="seg revised"
            style={{ width: `${pct(kpi.revised)}%` }}
            title={`수정 ${kpi.revised}`}
          />
          <div
            className="seg feedback"
            style={{ width: `${pct(kpi.feedback)}%` }}
            title={`피드백 ${kpi.feedback}`}
          />
          <div
            className="seg pending"
            style={{ width: `${pct(kpi.pending)}%` }}
            title={`미검토 ${kpi.pending}`}
          />
        </div>
        <div className="progress-legend">
          <span>
            <span className="dot" style={{ background: "var(--green-600)" }} />
            픽스 {kpi.fixed} ({pct(kpi.fixed)}%)
          </span>
          <span>
            <span className="dot" style={{ background: "var(--gold-600)" }} />
            수정 완료 {kpi.revised} ({pct(kpi.revised)}%)
          </span>
          <span>
            <span className="dot" style={{ background: "var(--orange-600)" }} />
            피드백 옴 {kpi.feedback} ({pct(kpi.feedback)}%)
          </span>
          <span>
            <span className="dot" style={{ background: "var(--blue-600)" }} />
            미검토 {kpi.pending} ({pct(kpi.pending)}%)
          </span>
          {kpi.excluded > 0 && (
            <span>
              <span className="dot" style={{ background: "var(--red-600)" }} />
              제외 {kpi.excluded} ({pct(kpi.excluded)}%)
            </span>
          )}
        </div>
      </div>

      {/* 우선 처리 필요 */}
      <div className="panel">
        <div className="panel-head">
          <h3>🚨 우선 처리 필요 ({priority.length}건)</h3>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>순위</th>
              <th>끝4자리</th>
              <th>이름</th>
              <th>분야</th>
              <th>시기</th>
              <th>상태</th>
              <th>v</th>
              <th>총점</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "var(--text-500)", padding: 30 }}>
                  로딩 중...
                </td>
              </tr>
            )}
            {!loading && priority.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "var(--green-600)", padding: 30, fontWeight: 600 }}>
                  ✓ 처리해야 할 메시지가 없습니다.
                </td>
              </tr>
            )}
            {priority.map((m) => (
              <tr key={m.id} onClick={() => onSelectMessage(m.id)}>
                <td>{m.rank}</td>
                <td><b>{m.tail4}</b></td>
                <td>{m.name_guess || "선생님"}</td>
                <td>
                  <span className="field-pill">{m.field}</span>
                </td>
                <td style={{ fontSize: 11, color: "var(--text-500)" }}>{m.period}</td>
                <td>
                  <span className={`status-tag ${m.status}`}>
                    {statusLabel(m.status)}
                  </span>
                </td>
                <td>v{m.current_version}</td>
                <td>{m.total_score ?? "-"}</td>
                <td>
                  <button
                    className="btn primary"
                    type="button"
                    style={{ padding: "4px 12px", fontSize: 11 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMessage(m.id);
                    }}
                  >
                    → 검토
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusLabel(s: string): string {
  switch (s) {
    case "pending":
      return "🔵 검토 대기";
    case "feedback":
      return "🟠 피드백";
    case "revised":
      return "🟡 수정 완료";
    case "fixed":
      return "🟢 픽스";
    case "excluded":
      return "🚫 제외";
    case "draft":
      return "⚪ 초안";
    default:
      return s;
  }
}
