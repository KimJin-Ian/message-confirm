"use client";

import NameSelector from "./NameSelector";
import type { Screen } from "./types";

type Props = {
  onGoReview: () => void;
};

export default function HomeScreen({ onGoReview }: Props) {
  return (
    <div className="screen active" id="screen-home">
      <div className="page-head">
        <div>
          <h2>안녕하세요 👋</h2>
          <div className="sub">
            메시지 컨펌 작업 — 진행 현황 · 로그인 없이 자유 편집
          </div>
        </div>
        <div className="actions">
          <NameSelector />
          <button className="btn" type="button">
            📤 픽스 일괄 내보내기
          </button>
          <button className="btn primary" type="button" onClick={onGoReview}>
            → 검토 시작
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        <div className="kpi featured">
          <div className="lbl">전체 메시지</div>
          <div className="num">50</div>
          <div className="delta">우선순위 50건</div>
        </div>
        <div className="kpi">
          <div className="lbl">픽스 완료 ✓</div>
          <div className="num" style={{ color: "var(--green-600)" }}>
            12
          </div>
          <div className="delta">24%</div>
        </div>
        <div className="kpi">
          <div className="lbl">수정 완료</div>
          <div className="num" style={{ color: "var(--gold-600)" }}>
            8
          </div>
          <div className="delta">확인 대기</div>
        </div>
        <div className="kpi">
          <div className="lbl">피드백 옴</div>
          <div className="num" style={{ color: "var(--orange-600)" }}>
            6
          </div>
          <div className="delta">재수정 대기</div>
        </div>
        <div className="kpi">
          <div className="lbl">미검토</div>
          <div className="num" style={{ color: "var(--blue-600)" }}>
            9
          </div>
          <div className="delta">검토 대기</div>
        </div>
      </div>

      {/* 전체 진행률 */}
      <div className="progress-overall">
        <div className="progress-head">
          <h3>📈 전체 진행률</h3>
          <div className="pct">
            24%{" "}
            <span
              style={{
                fontSize: "13px",
                color: "var(--text-500)",
                fontWeight: 400,
              }}
            >
              / 100%
            </span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="seg fixed" title="픽스 12"></div>
          <div className="seg revised" title="수정 완료 8"></div>
          <div className="seg feedback" title="피드백 옴 6"></div>
          <div className="seg pending" title="미검토 9"></div>
        </div>
        <div className="progress-legend">
          <span>
            <span
              className="dot"
              style={{ background: "var(--green-600)" }}
            ></span>
            픽스 12 (24%)
          </span>
          <span>
            <span
              className="dot"
              style={{ background: "var(--gold-600)" }}
            ></span>
            수정 완료 8 (16%)
          </span>
          <span>
            <span
              className="dot"
              style={{ background: "var(--orange-600)" }}
            ></span>
            피드백 옴 6 (12%)
          </span>
          <span>
            <span
              className="dot"
              style={{ background: "var(--blue-600)" }}
            ></span>
            미검토 9 (18%)
          </span>
          <span>
            <span className="dot" style={{ background: "var(--line)" }}></span>
            초안 대기 15 (30%)
          </span>
        </div>
      </div>

      {/* 최근 활동 + 픽스 미리보기 */}
      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <h3>🔔 최근 활동 (실시간)</h3>
            <span className="more">전체 보기 →</span>
          </div>
          <div className="panel-body" style={{ padding: "4px 20px" }}>
            <ActivityRow
              icon="💬"
              color="var(--orange-600)"
              title={
                <>
                  <b>이서진</b>이 1703(논문) 메시지에 피드백 남김
                </>
              }
              detail={'"풀 대필 표현을 빼주세요. 우리는 컨설팅 위주예요" · 5분 전'}
            />
            <ActivityRow
              icon="✓"
              color="var(--green-600)"
              title={
                <>
                  <b>이서진</b>이 4544(자서전) 메시지 픽스 완료
                </>
              }
              detail="발송 준비 OK · 23분 전"
            />
            <ActivityRow
              icon="✏️"
              color="var(--gold-600)"
              title={
                <>
                  <b>김진</b>이 3456(자비) 메시지 v3 업로드
                </>
              }
              detail='"원고 완성됨"으로 단정 수정 · 1시간 전'
            />
            <ActivityRow
              icon="📝"
              color="var(--blue-600)"
              title={
                <>
                  <b>김진</b>이 신규 5건 등록
                </>
              }
              detail="7522·1703·4544·3456·7501 · 2시간 전"
              last
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>✅ 최근 픽스된 메시지</h3>
            <span className="more">12건 전체 →</span>
          </div>
          <div className="panel-body" style={{ padding: "4px 20px" }}>
            <FixedPreviewRow
              id="4544 · 자서전"
              ago="23분 전"
              text='"오래 전이지만 자서전 문의 주셨던 분이시죠? 그때 말씀하셨던 이야기를..."'
            />
            <FixedPreviewRow
              id="3131 · 박사논문"
              ago="1시간 전"
              text='"논문 관련해서 두 번 연락 주셨던 분이시죠? 박사 1학기 때 구조 잡아두면..."'
            />
            <FixedPreviewRow
              id="8543 · 논문"
              ago="2시간 전"
              text='"2022년 4월쯤 논문 문의 주셨던 분이시죠? 페이지당 2만원 생각하셨던 게..."'
              last
            />
          </div>
        </div>
      </div>

      {/* 우선 처리 필요 */}
      <div className="panel">
        <div className="panel-head">
          <h3>🚨 우선 처리 필요 (검토/수정 필요)</h3>
        </div>
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>끝4자리</th>
              <th>분야</th>
              <th>상태</th>
              <th>버전</th>
              <th>마지막 활동</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <PriorityRow
              n={1}
              tail="1703"
              field="논문"
              status="pending"
              statusLabel="🔵 검토 대기"
              version="v1"
              ago="2시간 전"
              onClick={onGoReview}
            />
            <PriorityRow
              n={2}
              tail="3456"
              field="자비출판"
              status="revised"
              statusLabel="🟡 수정 완료"
              version="v3"
              ago="1시간 전"
              onClick={onGoReview}
            />
            <PriorityRow
              n={3}
              tail="7501"
              field="논문"
              status="pending"
              statusLabel="🔵 검토 대기"
              version="v1"
              ago="2시간 전"
              onClick={onGoReview}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityRow({
  icon,
  color,
  title,
  detail,
  last,
}: {
  icon: string;
  color: string;
  title: React.ReactNode;
  detail: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
        gap: "12px",
      }}
    >
      <span style={{ color, fontSize: "18px" }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: "12.5px",
            color: "var(--navy-900)",
            marginBottom: "2px",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-500)" }}>
          {detail}
        </div>
      </div>
    </div>
  );
}

function FixedPreviewRow({
  id,
  ago,
  text,
  last,
}: {
  id: string;
  ago: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        padding: "12px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <span
          style={{
            fontSize: "12.5px",
            color: "var(--navy-900)",
            fontWeight: 600,
          }}
        >
          {id}
        </span>
        <span
          style={{
            fontSize: "10px",
            color: "var(--green-600)",
            fontWeight: 700,
          }}
        >
          FIXED · {ago}
        </span>
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-500)",
          lineHeight: 1.55,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function PriorityRow({
  n,
  tail,
  field,
  status,
  statusLabel,
  version,
  ago,
  onClick,
}: {
  n: number;
  tail: string;
  field: string;
  status: "pending" | "revised";
  statusLabel: string;
  version: string;
  ago: string;
  onClick: () => void;
}) {
  return (
    <tr onClick={onClick}>
      <td>{n}</td>
      <td>{tail}</td>
      <td>
        <span className="field-pill">{field}</span>
      </td>
      <td>
        <span className={`status-tag ${status}`}>{statusLabel}</span>
      </td>
      <td>{version}</td>
      <td>{ago}</td>
      <td>
        <button
          className="btn primary"
          type="button"
          style={{ padding: "4px 12px", fontSize: "11px" }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          → 검토하기
        </button>
      </td>
    </tr>
  );
}
