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

  const goReview = () => setScreen("review");

  return (
    <NameProvider>
      <div className="app-wrapper">
        <Sidebar current={screen} onChange={setScreen} />
        <main className="main">
          {screen === "home" && <HomeScreen onGoReview={goReview} />}
          {screen === "review" && <ReviewScreen />}
          {screen === "fixed" && <FixedScreen />}
        </main>
        <Notes />
      </div>
    </NameProvider>
  );
}
