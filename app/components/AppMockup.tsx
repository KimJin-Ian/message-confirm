"use client";

import { useState } from "react";
import { NameProvider } from "./NameContext";
import Sidebar from "./Sidebar";
import HomeScreen from "./HomeScreen";
import ReviewScreen from "./ReviewScreen";
import FixedScreen from "./FixedScreen";
import Notes from "./Notes";
import type { Screen } from "./types";

export default function AppMockup() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const goReview = (messageId?: string) => {
    if (messageId) setSelectedMessageId(messageId);
    setScreen("review");
  };

  return (
    <NameProvider>
      <div className="app-wrapper">
        <Sidebar current={screen} onChange={setScreen} />
        <main className="main">
          {screen === "home" && <HomeScreen onSelectMessage={goReview} />}
          {screen === "review" && (
            <ReviewScreen
              messageId={selectedMessageId}
              onBack={() => setScreen("home")}
            />
          )}
          {screen === "fixed" && <FixedScreen onSelectMessage={goReview} />}
        </main>
        <Notes />
      </div>
    </NameProvider>
  );
}
