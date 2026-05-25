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

const SCREEN_LABEL: Record<Screen, string> = {
  home: "대시보드 홈",
  review: "검토 화면",
  fixed: "픽스 모음집",
  excluded: "제외 케이스",
};

export default function AppMockup() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [navOpen, setNavOpen] = useState(false);

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
      console.warn("[Realtime] 구독 실패", e);
    }
    const poll = setInterval(reload, 8000);
    return () => {
      if (unsub) unsub();
      clearInterval(poll);
    };
  }, [reload]);

  // 모바일 nav 열렸을 때 body scroll lock
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (navOpen) document.body.classList.add("nav-open");
    else document.body.classList.remove("nav-open");
    return () => document.body.classList.remove("nav-open");
  }, [navOpen]);

  // ESC로 nav 닫기
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  // 데스크탑 사이즈로 resize되면 nav 자동 닫기
  useEffect(() => {
    const onResize = () => {
      if (typeof window !== "undefined" && window.innerWidth > 980 && navOpen) {
        setNavOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [navOpen]);

  // KPI 카운트
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

  // 검토 큐 (rank ASC)
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

  const goReview = useCallback(
    (messageId?: string) => {
      let target = messageId;
      if (!target) target = reviewQueue[0];
      if (target) setSelectedMessageId(target);
      setScreen("review");
      setNavOpen(false);
      reload();
    },
    [reviewQueue, reload]
  );

  const goNext = useCallback(() => {
    if (currentIdx >= 0 && currentIdx < queueLen - 1) {
      setSelectedMessageId(reviewQueue[currentIdx + 1]);
    } else if (currentIdx === -1 && queueLen > 0) {
      setSelectedMessageId(reviewQueue[0]);
    }
  }, [currentIdx, queueLen, reviewQueue]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setSelectedMessageId(reviewQueue[currentIdx - 1]);
    }
  }, [currentIdx, reviewQueue]);

  useEffect(() => {
    if (screen !== "review") return;
    if (!selectedMessageId) return;
    if (reviewQueue.includes(selectedMessageId)) return;
    if (reviewQueue.length === 0) return;
    setSelectedMessageId(reviewQueue[0]);
  }, [reviewQueue, selectedMessageId, screen]);

  const navigate = useCallback(
    (next: Screen) => {
      setScreen(next);
      setNavOpen(false);
      reload();
    },
    [reload]
  );

  return (
    <NameProvider>
      {/* 모바일 상단 바 — 햄버거 + 현재 화면 + 라이브닷 */}
      <div className="mobile-topbar">
        <button
          type="button"
          className={`menu-toggle ${navOpen ? "open" : ""}`}
          aria-label={navOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="mobile-title">
          <div className="logo-mini">M</div>
          <div className="text">
            <div className="brand-line">메시지 컨펌</div>
            <div className="screen-line">{SCREEN_LABEL[screen]}</div>
          </div>
        </div>
        <div className="mobile-livedot" title="OPEN LINK · 누구나 접근">
          <span className="dot" />
        </div>
      </div>

      <div
        className="nav-backdrop"
        onClick={() => setNavOpen(false)}
        aria-hidden={!navOpen}
      />

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
