"use client";

import { useEffect, useState } from "react";
import {
  fetchAllMessages,
  fetchVersions,
  reactivateMessage,
  subscribeToMessages,
} from "@/lib/api";
import type { Message } from "@/lib/supabase";

type Props = {
  onSelectMessage: (messageId: string) => void;
};

interface Row {
  msg: Message;
  preview: string;
}

export default function ExcludedScreen({ onSelectMessage }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const all = await fetchAllMessages();
      const excludedOnly = all.filter((m) => m.status === "excluded");
      const previews = await Promise.all(
        excludedOnly.map(async (m) => {
          try {
            const vs = await fetchVersions(m.id);
            return { msg: m, preview: vs[0]?.body_text ?? "" };
          } catch {
            return { msg: m, preview: "" };
          }
        })
      );
      setRows(previews);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return subscribeToMessages(load);
  }, []);

  const reactivate = async (id: string) => {
    if (!confirm("이 케이스를 다시 검토 대상(pending)으로 되돌릴까요?")) return;
    try {
      await reactivateMessage(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "되돌리기 실패");
    }
  };

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.msg.tail4.includes(q) ||
      (r.msg.name_guess ?? "").toLowerCase().includes(q) ||
      r.preview.toLowerCase().includes(q) ||
      r.msg.field.includes(q)
    );
  });

  return (
    <div className="screen active" id="screen-excluded">
      <div className="page-head">
        <div>
          <h2>🚫 제외 케이스 ({rows.length}건)</h2>
          <div className="sub">
            검토 화면에서 제외된 케이스 목록 · "↩ 검토로" 누르면 다시 검토
            대상으로 복귀합니다
          </div>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={load}>
            🔄 새로고침
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "var(--red-50)",
            border: "1px solid var(--red-600)",
            color: "var(--red-600)",
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 12.5,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-body">
          <input
            type="text"
            className="btn"
            placeholder="🔎 끝4자리·이름·분야·본문 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", cursor: "text" }}
          />
        </div>
      </div>

      {loading && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--line)",
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
            color: "var(--text-500)",
          }}
        >
          로딩 중...
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div
          style={{
            background: "white",
            border: "1px dashed var(--line)",
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
            color: "var(--text-500)",
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>🗂</div>
          제외된 케이스가 아직 없습니다.
          <br />
          검토 화면에서 "🚫 이 케이스 제외" 버튼을 누르면 여기로 옮겨집니다.
        </div>
      )}

      {filtered.length > 0 && (
        <div className="fixed-grid">
          {filtered.map((r) => (
            <div
              key={r.msg.id}
              className="fixed-card"
              style={{ borderLeftColor: "var(--red-600)" }}
              onClick={() => onSelectMessage(r.msg.id)}
            >
              <div className="top">
                <span className="id">
                  #{r.msg.rank} · {r.msg.tail4}
                </span>
                <span className="field-pill">{r.msg.field}</span>
              </div>
              <h4>
                {r.msg.name_guess || "선생님"} · {r.msg.period} ·{" "}
                {r.msg.total_score?.toFixed(1)}점
              </h4>
              <div className="preview">
                {r.preview.replace(/\n/g, " ").slice(0, 120)}...
              </div>
              <div className="foot">
                <span>
                  {new Date(r.msg.updated_at).toLocaleString("ko-KR")} · v
                  {r.msg.current_version}
                </span>
                <span
                  className="copy-btn"
                  style={{ background: "var(--blue-600)", color: "white" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    reactivate(r.msg.id);
                  }}
                  role="button"
                  title="다시 검토 대상으로 되돌리기"
                >
                  ↩ 검토로 부활
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
