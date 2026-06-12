"use client";

import { useEffect, useRef, useState } from "react";

type BreakType = "default" | "short" | "meal";

const BREAK_DURATIONS: Record<BreakType, number> = {
  default: 10 * 60,
  short: 5 * 60,
  meal: 30 * 60,
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function sendBreakNotification(breakType: string, remainingMinutes: number) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Break Ending Soon!", {
      body: `Only ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""} left on your ${breakType} break. Get ready to resume studying!`,
      icon: "/favicon.ico",
      tag: "break-warning",
    });
  }
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export default function BreakTimer() {
  const [active, setActive] = useState(false);
  const [breakType, setBreakType] = useState<BreakType>("default");
  const [remaining, setRemaining] = useState(BREAK_DURATIONS.default);
  const [warned, setWarned] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertPlayedRef = useRef(false);

  useEffect(() => {
    if (!active) return;

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 60 && !alertPlayedRef.current) {
          alertPlayedRef.current = true;
          setWarned(true);
          const audio = new Audio("/sounds/alert.mp3");
          audio.play().catch(() => {});
          const breakLabel = breakType === "default" ? "standard" : breakType;
          sendBreakNotification(breakLabel, 1);
        }
        if (next <= 0) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("✅ Break Over!", {
              body: "Your break is done. Time to get back to studying!",
              icon: "/favicon.ico",
              tag: "break-over",
            });
          }
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  const startBreak = (type: BreakType) => {
    setBreakType(type);
    setRemaining(BREAK_DURATIONS[type]);
    setWarned(false);
    alertPlayedRef.current = false;
    setActive(true);
    requestNotificationPermission();
  };

  const resumeStudy = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActive(false);
    setWarned(false);
    alertPlayedRef.current = false;
  };

  return (
    <section
      className={`card transition-colors ${
        active
          ? warned
            ? "border-2 border-purple-500 bg-purple-50 animate-pulse"
            : "border-2 border-purple-300 bg-purple-50/50"
          : ""
      }`}
    >
      <h2 className="card-title">Break Timer</h2>

      {!active ? (
        <div className="space-y-3">
          <button
            type="button"
            className="btn-primary w-full"
            onClick={() => startBreak("default")}
          >
            Take a Break ☕ (10 min)
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => startBreak("short")}
            >
              Short (5 min)
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => startBreak("meal")}
            >
              Meal (30 min)
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          {warned && (
            <div className="mb-3 rounded-lg bg-red-100 px-4 py-3 text-center">
              <p className="font-bold text-red-700">⏰ 1 minute remaining!</p>
              <p className="text-sm text-red-600">Get ready to resume studying</p>
            </div>
          )}
          <p className="mb-1 text-sm text-slate-500 capitalize">
            {breakType === "default" ? "Standard break" : `${breakType} break`}
          </p>
          <p className="mb-4 text-5xl font-bold text-purple-700">
            {formatTime(remaining)}
          </p>
          <button type="button" className="btn-primary" onClick={resumeStudy}>
            Resume Study
          </button>
        </div>
      )}
    </section>
  );
}
