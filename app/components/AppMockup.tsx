"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NameProvider } from "./NameContext";
import Sidebar from "./Sidebar";
import HomeScreen from "./HomeScreen";
import ReviewScreen from "./ReviewScreen";
import FixedScreen from "./FixedScreen";
import ExcludedScreen from "./ExcludedScreen";
import type { Screen } from "./types";
import {
  fetchAllMessages,
  subscribeToMessages,
} from "@/lib/api";
import type { Message } from "@/lib/supabase";

const REVIEW_STATUSES = new Set<Message["status"]>([
  "pending",
  "revised",
  "feedback",
]);

export default function AppMockup() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // ───── 데이터 로드 ─────
  const reload = useCallback(async () => {
    try {
      const all = await fetchAllMessages();
      setMessages(all);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    reload();
    let unsub: (() => void) | undefined;
    try {
      unsub = subscribeToMessages(reload);
    } catch (e) {
      console.warn("[Realtime] 구독 실패 — 환경변수/Realtime 설정 확인", e);
    }
    // 백업 폴링: Realtime이 안 되거나 누락된 변경 잡기 위해 8초마다
    const poll = setInterval(reload, 8000);
    return () => {
      if (unsub) unsub();
      clearInterval(poll);
    };
  }, [reload]);

  // ───── KPI 카운트 (사이드바 배지용) ─────
  const counts = useMemo(() => {
    const c = {
      total: 0,
      fixed: 0,
      revised: 0,
      feedback: 0,
      pending: 0,
      excluded: 0,
      draft: 0,
    };
    for (const m of messages) {
      c.total++;
      const k = m.status as keyof typeof c;
      if (k in c) c[k]++;
    }
    return c;
  }, [messages]);

  // ───── 검토 큐 (rank 오름차순) ─────
  const reviewQueue = useMemo(
    () =>
      messages
        .filter((m) => REVIEW_STATUSES.has(m.status))
        .sort((a, b) => a.rank - b.rank)
        .map((m) => m.id),
    [messages]
  );

  const currentIdx = selectedMessageId
    ? reviewQueue.indexOf(selectedMessageId)
    : -1;
  const queueLen = reviewQueue.length;

  // ───── 네비게이션 ─────
  const goReview = useCallback(
    (messageId?: string) => {
      let target = messageId;
      if (!target) {
        // messageId가 없으면 큐의 첫 항목 자동 선택
        target = reviewQueue[0];
      }
      if (target) setSelectedMessageId(target);
      setScreen("review");
      reload(); // 진입 시 한 번 더 fresh
    },
    [reviewQueue, reload]
  );

  const goNext = useCallback(() => {
    if (currentIdx >= 0 && currentIdx < queueLen - 1) {
      setSelectedMessageId(reviewQueue[currentIdx + 1]);
    } else if (currentIdx === -1 && queueLen > 0) {
      // 현재 메시지가 큐 밖(이미 픽스/제외)이면 첫 항목으로
      setSelectedMessageId(reviewQueue[0]);
    }
  }, [currentIdx, queueLen, reviewQueue]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setSelectedMessageId(reviewQueue[currentIdx - 1]);
    }
  }, [currentIdx, reviewQueue]);

  // 현재 선택한 메시지가 처리되어 큐에서 빠지면, 같은 인덱스의 다음 메시지로 자동 이동
  useEffect(() => {
    if (screen !== "review") return;
    if (!selectedMessageId) return;
    const stillInQueue = reviewQueue.includes(selectedMessageId);
    if (stillInQueue) return;
    // 큐 밖 — 처리됨. 큐의 같은 위치 또는 마지막으로
    if (reviewQueue.length === 0) return;
    // 그냥 첫 항목으로 (가장 우선순위 높은 것)
    setSelectedMessageId(reviewQueue[0]);
  }, [reviewQueue, selectedMessageId, screen]);

  // 화면 전환 시 데이터 fresh
  const navigate = useCallback(
    (next: Screen) => {
      setScreen(next);
      reload();
    },
    [reload]
  );

  return (
    <NameProvider>
      <div className="app-wrapper">
        <Sidebar current={screen} onChange={navigate} counts={counts} />
        <main className="main">
          {screen === "home" && <HomeScreen onSelectMessage={goReview} />}
          {screen === "review" && (
            <ReviewScreen
              messageId={selectedMessageId}
              queueIndex={currentIdx}
              queueTotal={queueLen}
              onPrev={goPrev}
              onNext={goNext}
              canPrev={currentIdx > 0}
              canNext={currentIdx >= 0 && currentIdx < queueLen - 1}
              onBack={() => navigate("home")}
            />
          )}
          {screen === "fixed" && <FixedScreen onSelectMessage={goReview} />}
          {screen === "excluded" && <ExcludedScreen onSelectMessage={goReview} />}
        </main>
      </div>
    </NameProvider>
  );
}
