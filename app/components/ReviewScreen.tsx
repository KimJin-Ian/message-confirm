"use client";

import { useEffect, useRef, useState } from "react";
import NameSelector from "./NameSelector";
import { useAuthor } from "./NameContext";

type Comment = {
  id: string;
  author: string;
  body: string;
  meta: string;
  fromKim?: boolean;
};

const INITIAL_V3 = `안녕하세요 선생님.
위드에스마케팅 이서진입니다.

2024년 3월쯤에 논문 문의 주셨던 분이시죠?
그때 비용 부분에서 조금 고민되셨던 게 기억나서요.

저희가 그때 이후로 분량·범위에 따라 패키지를 좀 더 세분화했거든요.
"형틀만 잡아주는 초안" "구조 컨설팅만" 이런 식으로
선생님 예산 안에서 진행하는 방법도 있어서요.

논문 주제·현재 상황 한 줄만 알려주시면
지금 가능한 옵션 정리해서 견적 드릴게요. 부담 없이요.

▶ 카톡 채널: pf.kakao.com/_QkZhd`;

const INITIAL_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "이서진",
    meta: "2시간 전 · v1에 코멘트",
    body: '"풀 대필"이라는 표현은 빼주세요. 우리는 컨설팅 위주라 그런 단어 쓰면 안 돼요.',
  },
  {
    id: "c2",
    author: "김진",
    meta: "1시간 30분 전 · v2 업로드",
    body: '"풀 대필" 표현 제거, "형틀만 잡아주는 초안" / "구조 컨설팅만"으로 보완했습니다.',
    fromKim: true,
  },
  {
    id: "c3",
    author: "이서진",
    meta: "1시간 25분 전",
    body: '좋아요. 근데 "예산 안에서"라는 표현이 가격 협상 같은 느낌. 좀 더 부드럽게 바꿔주세요.',
  },
  {
    id: "c4",
    author: "김진",
    meta: "1시간 전 · v3 업로드",
    body: '"예산 안에서" → "분량·범위에 따라 패키지 세분화" + "부담 없이요"로 톤 다운. 인용 본인이 한 말 ("형틀만") 정확히 반영.',
    fromKim: true,
  },
];

const QUICK_FB = ["✏️ 톤 조정", "🚫 단어 빼기", "➕ 사례 추가", "📏 더 짧게"];

export default function ReviewScreen() {
  const { name } = useAuthor();
  const editorRef = useRef<HTMLDivElement>(null);
  const [v3Text, setV3Text] = useState<string>(INITIAL_V3);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [draftComment, setDraftComment] = useState("");

  // Keep contentEditable in sync only on initial mount + on "원래대로"
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== v3Text) {
      editorRef.current.innerText = v3Text;
    }
    // We intentionally do NOT depend on v3Text to avoid caret jumps while typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restoreV3 = () => {
    setV3Text(INITIAL_V3);
    if (editorRef.current) editorRef.current.innerText = INITIAL_V3;
  };

  const saveAsV4 = () => {
    const current = editorRef.current?.innerText ?? v3Text;
    setV3Text(current);
    const displayName = name || "익명";
    setComments((prev) => [
      ...prev,
      {
        id: `c${prev.length + 1}`,
        author: displayName,
        meta: "방금 · v4 저장",
        body: "v4로 직접 수정 저장됨.",
        fromKim: displayName === "김진",
      },
    ]);
  };

  const sendComment = () => {
    if (!draftComment.trim()) return;
    const displayName = name || "익명";
    setComments((prev) => [
      ...prev,
      {
        id: `c${prev.length + 1}`,
        author: displayName,
        meta: "방금",
        body: draftComment.trim(),
        fromKim: displayName === "김진",
      },
    ]);
    setDraftComment("");
  };

  const appendQuick = (text: string) => {
    setDraftComment((prev) =>
      prev ? `${prev}\n${text}` : text
    );
  };

  return (
    <div className="screen active" id="screen-review">
      <div className="page-head">
        <div>
          <h2>검토 화면 — 1703 (논문 · 가격저항)</h2>
          <div className="sub">
            v3 · 김진 1시간 전 업로드 · 현재 검토 대기
          </div>
        </div>
        <div className="actions">
          <NameSelector />
          <button className="btn" type="button">
            ← 이전
          </button>
          <button className="btn" type="button">
            다음 →
          </button>
        </div>
      </div>

      <div className="compare-view">
        {/* LEFT: 원문 */}
        <div className="compare-col">
          <div className="col-head">
            <span>📜 원문 (Raw) · 변경 불가</span>
            <span className="edit-hint readonly">읽기 전용</span>
          </div>
          <div className="col-body">
            <div className="raw-meta">
              <b>끝4자리</b>
              <span>1703</span>
              <b>분야</b>
              <span>논문 · 가격저항</span>
              <b>점수</b>
              <span>100점 (1순위)</span>
              <b>시점</b>
              <span>2024년 3월쯤</span>
              <b>원본 파일</b>
              <span style={{ fontSize: "10px", wordBreak: "break-all" }}>
                (2달)24_03_10-24.04.31...
              </span>
            </div>
            <div className="raw-text">
              {`중3대상, 내년 고교학점제를 준비하기 위한 구체적인 방안
이 주제로 논문 작성하려고 합니다 [M1]

`}
              <strong>
                450만원 비용이 부담스러운데, 형틀만 잡아주는 초안 정도의 글이면 얼마에 가능할까요?
              </strong>
              {`[M1]
50만원이요[M1]
목차 기획이라는게 구체적으로 어디까지 써준다는 뜻인가요?[M1]
50페이지 분량에 논문이 필요합니다
분량이 많지 않은데, 가격은 어떻게 될까요?[M1]`}
            </div>
          </div>
        </div>

        {/* CENTER: 메시지 버전들 */}
        <div className="compare-col">
          <div className="col-head">
            <span>📨 메시지 버전 (v1 → v3)</span>
            <span className="edit-hint">✏️ 직접 수정 OK</span>
          </div>
          <div className="col-body">
            <div className="msg-history">
              📌 현재 버전 (검토 대기) — 클릭하면 직접 수정 가능
            </div>

            <div
              ref={editorRef}
              className="msg-version current"
              data-version="3"
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              onBlur={(e) => setV3Text(e.currentTarget.innerText)}
            />

            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              <button
                className="btn green"
                type="button"
                style={{ padding: "5px 12px", fontSize: "11.5px" }}
                onClick={saveAsV4}
              >
                💾 v4로 저장
              </button>
              <button
                className="btn"
                type="button"
                style={{ padding: "5px 12px", fontSize: "11.5px" }}
                onClick={restoreV3}
              >
                ↩ 원래대로
              </button>
            </div>

            <div className="msg-history">📚 이전 버전</div>
            <div
              className="msg-version draft"
              data-version="2"
              style={{ opacity: 0.7 }}
            >{`안녕하세요 선생님.
위드에스마케팅 이서진입니다.

2024년 3월쯤에 논문 문의 주셨던 분이시죠?
"풀 대필"이 아니더라도 "초안 형틀만" "구조 컨설팅만"
이런 식으로 진행하는 방법도 있어서요.

논문 주제 한 줄만 알려주시면 견적 드릴게요.`}</div>

            <div
              className="msg-version draft"
              data-version="1"
              style={{ opacity: 0.55 }}
            >{`안녕하세요 선생님!
위드에스마케팅 이서진입니다.

예전에 논문 컨설팅 문의 주셨던 분이시죠?
대필이 아닌 컨설팅으로 하시면, 교수님께서도 자연스럽게 통과되고
선생님 실력도 함께 올라가서 더 좋은 방법이에요.

학교·학과·논문 주제 방향만 한 줄 알려주시면
맞춤으로 다시 안내드릴게요!`}</div>
          </div>
        </div>

        {/* RIGHT: 피드백 */}
        <div className="compare-col feedback">
          <div className="col-head">
            <span>💬 실시간 피드백</span>
            <span className="edit-hint">누구나 작성 가능</span>
          </div>
          <div className="col-body">
            <div className="comment-stream">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`comment ${c.fromKim ? "from-kim" : "from-ceo"}`}
                >
                  <div className="meta">
                    <b>{c.author}</b>
                    <span>{c.meta}</span>
                  </div>
                  <div className="body">{c.body}</div>
                </div>
              ))}
            </div>

            <div className="feedback-input">
              <div className="author-row">
                <label htmlFor="comment-author">작성자:</label>
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
                      onClick={() => appendQuick(q)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") appendQuick(q);
                      }}
                    >
                      {q}
                    </span>
                  ))}
                </div>
                <button
                  className="btn primary"
                  type="button"
                  style={{ padding: "5px 14px", fontSize: "11px" }}
                  onClick={sendComment}
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
            📌 누구나 픽스/제외 가능 (이름은 자유 입력)
          </span>
        </div>
        <div className="right">
          <button className="btn red" type="button">
            🚫 이 케이스 제외
          </button>
          <button className="btn" type="button">
            💬 더 수정 요청
          </button>
          <button className="btn green" type="button">
            ✓ 픽스 (발송 OK)
          </button>
        </div>
      </div>
    </div>
  );
}
