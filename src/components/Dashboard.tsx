"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UserData } from "@/lib/types";
import Header from "./Header";
import StreamSubjects from "./StreamSubjects";
import GoalsForm from "./GoalsForm";
import StudyTracker from "./StudyTracker";
import Timetable from "./Timetable";
import PlannedVsActualChart from "./PlannedVsActualChart";
import MarksChart from "./MarksChart";
import AIInsights from "./AIInsights";
import BreakTimer from "./BreakTimer";
import CelebrationToast from "./CelebrationToast";

interface DashboardProps {
  userId: string;
}

export default function Dashboard({ userId }: DashboardProps) {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);
  const celebratedRef = useRef<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = (await res.json()) as UserData;
      setData(json);
      setError(null);
    } catch {
      setError("Could not load your dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [fetchData]);

  const triggerCelebration = (subject: string) => {
    const key = `${new Date().toISOString().slice(0, 10)}:${subject}`;
    if (celebratedRef.current.has(key)) return;
    celebratedRef.current.add(key);
    setCelebration(subject);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg text-slate-600">Loading your H2Know dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-lg text-red-600">{error ?? "Something went wrong."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header userId={userId} streak={data.streak} />
      {celebration && (
        <CelebrationToast
          subject={celebration}
          onClose={() => setCelebration(null)}
        />
      )}
      <main className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-2 lg:p-6">
        <StreamSubjects
          userId={userId}
          streamData={data.streamData}
          onUpdate={(streamData) => setData({ ...data, streamData })}
        />
        <GoalsForm
          userId={userId}
          goals={data.goals}
          onUpdate={(goals) => setData({ ...data, goals })}
        />
        <StudyTracker
          userId={userId}
          logs={data.logs}
          subjects={data.streamData.subjects}
          streak={data.streak}
          onLogAdded={(logs, streak) => {
            setData({ ...data, logs, streak });
          }}
        />
        <BreakTimer />
        <Timetable
          userId={userId}
          timetable={data.timetable}
          onGenerated={(timetable) => setData({ ...data, timetable })}
        />
        <PlannedVsActualChart
          logs={data.logs}
          timetable={data.timetable}
          onGoalMatched={triggerCelebration}
        />
        <MarksChart subjects={data.streamData.subjects} />
        <AIInsights
          userId={userId}
          stream={data.streamData.stream}
          subjects={data.streamData.subjects}
          studyLogs={data.logs}
          goals={data.goals}
          lastInsight={data.lastInsight}
          onInsight={(lastInsight) => setData({ ...data, lastInsight })}
        />
      </main>
    </div>
  );
}
