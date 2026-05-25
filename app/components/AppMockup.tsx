"use client";

import { useCallback, useEffect, useState } from "react";
import { NameProvider } from "./NameContext";
import Sidebar from "./Sidebar";
import HomeScreen from "./HomeScreen";
import ReviewScreen from "./ReviewScreen";
import FixedScreen from "./FixedScreen";
import ExcludedScreen from "./ExcludedScreen";
import type { Screen } from "./types";
import {
  fetchKpiCounts,
  subscribeToMessages,
  type KpiCounts,
} from "@/lib/api";

export default function AppMockup() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [counts, setCounts] = useState<KpiCounts | null>(null);

  const reloadCounts = useCallback(async () => {
    try {
      setCounts(await fetchKpiCounts());
    } catch {
      // 환경변수 누락 등 — Sidebar 배지는 그냥 숨김
      setCounts(null);
    }
  }, []);

  useEffect(() => {
    reloadCounts();
    return subscribeToMessages(reloadCounts);
  }, [reloadCounts]);

  const goReview = (messageId?: string) => {
    if (messageId) setSelectedMessageId(messageId);
    setScreen("review");
  };

  return (
    <NameProvider>
      <div className="app-wrapper">
        <Sidebar current={screen} onChange={setScreen} counts={counts} />
        <main className="main">
          {screen === "home" && <HomeScreen onSelectMessage={goReview} />}
          {screen === "review" && (
            <ReviewScreen
              messageId={selectedMessageId}
              onBack={() => setScreen("home")}
            />
          )}
          {screen === "fixed" && <FixedScreen onSelectMessage={goReview} />}
          {screen === "excluded" && <ExcludedScreen onSelectMessage={goReview} />}
        </main>
      </div>
    </NameProvider>
  );
}
