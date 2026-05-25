"use client";

import { useEffect, useState } from "react";
import {
  fetchAllMessages,
  fetchVersions,
  subscribeToMessages,
} from "@/lib/api";
import type { Message } from "@/lib/supabase";

type Props = {
  onSelectMessage: (messageId: string) => void;
};

interface FixedRow {
  msg: Message;
  preview: string;
}

export default function FixedScreen({ onSelectMessage }: Props) {
  const [rows, setRows] = useState<FixedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "rank" | "score">("recent");

  const load = async () => {
    try {
      const all = await fetchAllMessages();
      const fixedOnly = all.filter((m) => m.status === "fixed");
      // 각 메시지의 현재 버전 본문 미리보기
      const previews = await Promise.all(
        fixedOnly.map(async (m) => {
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

  // 필터링
  const filtered = rows.filter((r) => {
    if (fieldFilter !== "all" && r.msg.field !== fieldFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !r.msg.tail4.includes(q) &&
        !(r.msg.name_guess ?? "").toLowerCase().includes(q) &&
        !r.preview.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "rank") return a.msg.rank - b.msg.rank;
    if (sort === "score") return (b.msg.total_score ?? 0) - (a.msg.total_score ?? 0);
    // recent
    const at = a.msg.fixed_at ?? a.msg.updated_at;
    const bt = b.msg.fixed_at ?? b.msg.updated_at;
    return new Date(bt).getTime() - new Date(at).getTime();
  });

  const fieldCounts: Record<string, number> = {};
  rows.forEach((r) => {
    fieldCounts[r.msg.field] = (fieldCounts[r.msg.field] ?? 0) + 1;
  });
  const fields = Object.keys(fieldCounts).sort();

  const copyBody = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("✓ 복사됨");
    } catch {
      alert("복사 실패 (브라우저 권한 확인)");
    }
  };

  const exportCsv = () => {
    if (sorted.length === 0) return;
    const header = ["순위", "끝4자리", "이름", "분야", "시기", "총점", "본문"];
    const lines = [header.join(",")];
    for (const r of sorted) {
      const safe = (s: string | null | undefined) =>
        `"${(s ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
      lines.push(
        [
          r.msg.rank,
          r.msg.tail4,
          safe(r.msg.name_guess),
          safe(r.msg.field),
          safe(r.msg.period),
          r.msg.total_score ?? "",
          safe(r.preview),
        ].join(",")
      );
    }
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fixed_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="screen active" id="screen-fixed">
      <div className="page-head">
        <div>
          <h2>픽스 모음집 ({rows.length}건)</h2>
          <div className="sub">컨펌 완료 · 발송 준비 OK</div>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={load}>
            🔄 새로고침
          </button>
          <button className="btn primary" type="button" onClick={exportCsv} disabled={sorted.length === 0}>
            📤 CSV 내보내기
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select className="btn" value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)}>
              <option value="all">분야 전체 ({rows.length})</option>
              {fields.map((f) => (
                <option key={f} value={f}>
                  {f} ({fieldCounts[f]})
                </option>
              ))}
            </select>
            <select className="btn" value={sort} onChange={(e) => setSort(e.target.value as "recent" | "rank" | "score")}>
              <option value="recent">최근 픽스순</option>
              <option value="rank">순위순</option>
              <option value="score">점수 높은순</option>
            </select>
            <input
              type="text"
              className="btn"
              placeholder="🔎 끝4자리·이름·본문 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, cursor: "text" }}
            />
          </div>
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
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          아직 픽스된 메시지가 없습니다.
          <br />
          검토 화면에서 "✓ 픽스" 버튼을 누르면 여기에 모입니다.
        </div>
      )}

      {sorted.length > 0 && (
        <div className="fixed-grid">
          {sorted.map((r) => (
            <div
              key={r.msg.id}
              className="fixed-card"
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
                  {r.msg.fixed_at
                    ? new Date(r.msg.fixed_at).toLocaleString("ko-KR")
                    : "—"}{" "}
                  · v{r.msg.current_version}
                </span>
                <span
                  className="copy-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyBody(r.preview);
                  }}
                  role="button"
                >
                  📋 복사
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
