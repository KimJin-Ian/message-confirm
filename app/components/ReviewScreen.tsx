"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import NameSelector from "./NameSelector";
import { useAuthor } from "./NameContext";
import {
  fetchMessage,
  fetchVersions,
  fetchComments,
  saveNewVersion,
  postComment,
  updateMessageStatus,
  subscribeToMessage,
} from "@/lib/api";
import type { Message, MessageVersion, Comment } from "@/lib/supabase";

const QUICK_FB = ["✏️ 톤 조정", "🚫 단어 빼기", "➕ 사례 추가", "📏 더 짧게"];

type Props = {
  messageId: string | null;
  onBack: () => void;
};

export default function ReviewScreen({ messageId, onBack }: Props) {
  const { name } = useAuthor();
  const editorRef = useRef<HTMLDivElement>(null);

  const [msg, setMsg] = useState<Message | null>(null);
  const [versions, setVersions] = useState<MessageVersion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draftComment, setDraftComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!messageId) return;
    try {
      const [m, vs, cs] = await Promise.all([
        fetchMessage(messageId),
        fetchVersions(messageId),
        fetchComments(messageId),
      ]);
      setMsg(m);
      setVersions(vs);
      setComments(cs);
      setError(null);
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : "데이터 로드 실패";
      setError(m);
    }
  }, [messageId]);

  // 최초 로드 + Realtime
  useEffect(() => {
    load();
    if (!messageId) return;
    return subscribeToMessage(messageId, load);
  }, [messageId, load]);

  // contenteditable에 현재 버전 텍스트 초기 주입
  useEffect(() => {
    const current = versions[0];
    if (current && editorRef.current && editorRef.current.innerText !== current.body_text) {
      editorRef.current.innerText = current.body_text;
    }
  }, [versions]);

  if (!messageId) {
    return (
      <div className="screen active" id="screen-review">
        <div className="page-head">
          <div>
            <h2>검토 화면</h2>
            <div className="sub">
              홈 대시보드에서 메시지를 선택해주세요.
            </div>
          </div>
          <div className="actions">
            <button className="btn" type="button" onClick={onBack}>
              ← 홈으로
            </button>
          </div>
        </div>
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
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          선택된 메시지가 없습니다.
          <br />
          <button
            className="btn primary"
            type="button"
            style={{ marginTop: 16 }}
            onClick={onBack}
          >
            → 홈에서 우선 처리 목록 보기
          </button>
        </div>
      </div>
    );
  }

  if (!msg) {
    return (
      <div className="screen active" id="screen-review">
        <div className="page-head">
          <div>
            <h2>로딩 중...</h2>
          </div>
        </div>
      </div>
    );
  }

  const currentVersion = versions[0];

  const saveCurrent = async () => {
    const text = editorRef.current?.innerText ?? "";
    if (!text.trim()) return;
    if (currentVersion && text === currentVersion.body_text) {
      setError("내용이 동일해서 새 버전으로 저장하지 않았습니다.");
      return;
    }
    setBusy(true);
    try {
      await saveNewVersion(msg.id, text, name || null);
      setError(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const restoreOriginal = () => {
    if (currentVersion && editorRef.current) {
      editorRef.current.innerText = currentVersion.body_text;
    }
  };

  const sendComment = async () => {
    if (!draftComment.trim()) return;
    setBusy(true);
    try {
      await postComment(
        msg.id,
        draftComment.trim(),
        name || null,
        currentVersion?.version_num ?? null
      );
      setDraftComment("");
      setError(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "코멘트 저장 실패");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (next: "fixed" | "excluded" | "feedback") => {
    setBusy(true);
    try {
      await updateMessageStatus(msg.id, next);
      setError(null);
      if (next === "fixed" || next === "excluded") {
        onBack();
      } else {
        await load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "상태 변경 실패");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="screen active" id="screen-review">
      <div className="page-head">
        <div>
          <h2>
            검토 화면 — {msg.tail4} ({msg.field})
          </h2>
          <div className="sub">
            Rank {msg.rank} · 총점 {msg.total_score} · 시기 {msg.period} · 본문 {msg.body_len}자 · 현재 v{msg.current_version}
          </div>
        </div>
        <div className="actions">
          <NameSelector />
          <button className="btn" type="button" onClick={onBack}>
            ← 홈
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
            marginBottom: 12,
            fontSize: 12.5,
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div className="compare-view">
        {/* 원문 */}
        <div className="compare-col">
          <div className="col-head">
            <span>📜 원문 (Raw) · 변경 불가</span>
            <span className="edit-hint readonly">읽기 전용</span>
          </div>
          <div className="col-body">
            <div className="raw-meta">
              <b>끝4자리</b>
              <span>{msg.tail4}</span>
              <b>이름</b>
              <span>{msg.name_guess || "선생님"}</span>
              <b>분야</b>
              <span>{msg.field}</span>
              <b>총점</b>
              <span>{msg.total_score} (재{msg.recency_score}/풍{msg.richness_score}/가{msg.potential_score})</span>
              <b>시기</b>
              <span>{msg.period}</span>
              <b>본문 길이</b>
              <span>{msg.body_len}자</span>
              <b>원본 파일</b>
              <span style={{ fontSize: 10, wordBreak: "break-all" }}>{msg.source_file}</span>
            </div>
            <div className="raw-text">{msg.raw_text}</div>
          </div>
        </div>

        {/* 메시지 버전들 */}
        <div className="compare-col">
          <div className="col-head">
            <span>📨 메시지 버전 (v1 → v{msg.current_version})</span>
            <span className="edit-hint">✏️ 직접 수정 OK</span>
          </div>
          <div className="col-body">
            <div className="msg-history">
              📌 현재 버전 (v{currentVersion?.version_num ?? "-"}) — 클릭하면 직접 수정 가능
            </div>

            <div
              ref={editorRef}
              className="msg-version current"
              data-version={currentVersion?.version_num ?? ""}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
            />

            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <button
                className="btn green"
                type="button"
                style={{ padding: "5px 12px", fontSize: 11.5 }}
                onClick={saveCurrent}
                disabled={busy}
              >
                💾 새 버전(v{(currentVersion?.version_num ?? 0) + 1})으로 저장
              </button>
              <button
                className="btn"
                type="button"
                style={{ padding: "5px 12px", fontSize: 11.5 }}
                onClick={restoreOriginal}
              >
                ↩ 원래대로
              </button>
            </div>

            {versions.length > 1 && (
              <>
                <div className="msg-history">📚 이전 버전</div>
                {versions.slice(1).map((v) => (
                  <div
                    key={v.id}
                    className="msg-version draft"
                    data-version={v.version_num}
                    style={{ opacity: 0.7 - (versions.indexOf(v) - 1) * 0.1 }}
                  >
                    {v.body_text}
                    <div style={{ fontSize: 10, color: "var(--gold-500)", marginTop: 8 }}>
                      ✍ {v.author_name || "익명"} · {new Date(v.created_at).toLocaleString("ko-KR")}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* 피드백 */}
        <div className="compare-col feedback">
          <div className="col-head">
            <span>💬 실시간 피드백 ({comments.length})</span>
            <span className="edit-hint">누구나 작성 가능</span>
          </div>
          <div className="col-body">
            <div className="comment-stream">
              {comments.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text-500)", textAlign: "center", padding: 12 }}>
                  아직 코멘트가 없습니다.
                </div>
              )}
              {comments.map((c) => {
                const isKim = c.author_name === "김진";
                return (
                  <div
                    key={c.id}
                    className={`comment ${isKim ? "from-kim" : "from-ceo"}`}
                  >
                    <div className="meta">
                      <b>{c.author_name || "익명"}</b>
                      <span>
                        {new Date(c.created_at).toLocaleString("ko-KR")}
                        {c.replied_to_version ? ` · v${c.replied_to_version}에 코멘트` : ""}
                      </span>
                    </div>
                    <div className="body">{c.body}</div>
                  </div>
                );
              })}
            </div>

            <div className="feedback-input">
              <div className="author-row">
                <label>작성자:</label>
                <NameSelector />
              </div>
              <textarea
                placeholder="피드백 작성... (자유롭게)"
                value={draftComment}
                onChange={(e) => setDraftComment(e.target.value)}
                aria-label="피드백 내용"
              />
              <div className="row">
                <div className="fb-quick">
                  {QUICK_FB.map((q) => (
                    <span
                      key={q}
                      onClick={() => setDraftComment((p) => (p ? `${p}\n${q}` : q))}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setDraftComment((p) => (p ? `${p}\n${q}` : q));
                      }}
                    >
                      {q}
                    </span>
                  ))}
                </div>
                <button
                  className="btn primary"
                  type="button"
                  style={{ padding: "5px 14px", fontSize: 11 }}
                  onClick={sendComment}
                  disabled={busy || !draftComment.trim()}
                >
                  코멘트 전송
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="decision-bar">
        <div className="left">
          <span className="hint">
            📌 누구나 픽스/제외 가능 — 현재 상태: <b>{statusKo(msg.status)}</b>
          </span>
        </div>
        <div className="right">
          <button
            className="btn red"
            type="button"
            onClick={() => decide("excluded")}
            disabled={busy}
          >
            🚫 이 케이스 제외
          </button>
          <button
            className="btn"
            type="button"
            onClick={() => decide("feedback")}
            disabled={busy}
          >
            💬 더 수정 요청
          </button>
          <button
            className="btn green"
            type="button"
            onClick={() => decide("fixed")}
            disabled={busy}
          >
            ✓ 픽스 (발송 OK)
          </button>
        </div>
      </div>
    </div>
  );
}

function statusKo(s: string): string {
  switch (s) {
    case "pending":
      return "검토 대기";
    case "feedback":
      return "피드백";
    case "revised":
      return "수정 완료";
    case "fixed":
      return "픽스 완료 ✓";
    case "excluded":
      return "제외됨 🚫";
    case "draft":
      return "초안";
    default:
      return s;
  }
}
