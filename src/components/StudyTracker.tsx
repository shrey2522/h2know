"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import confetti from "canvas-confetti";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StreakData, StudyLog, SubjectMark } from "@/lib/types";
import CelebrationToast from "./CelebrationToast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StudyTrackerProps {
  userId: string;
  logs: StudyLog[];
  subjects: SubjectMark[];
  streak: StreakData;
  onLogAdded: (logs: StudyLog[], streak: StreakData) => void;
}

interface TimerSession {
  id: string;
  subject: string;
  plannedHours: number;
  actualHours: number;
  startTime: number;
  initialRemainingSeconds: number;
  completed: boolean;
  displayActualHours: number;
  celebrated: boolean;
}

interface ActiveCelebration {
  id: string;
  subject: string;
}

function formatCountdown(totalSeconds: number): string {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getRemainingSeconds(session: TimerSession): number {
  if (session.completed) return 0;
  const elapsed = (Date.now() - session.startTime) / 1000;
  return Math.max(0, session.initialRemainingSeconds - elapsed);
}

function fireConfettiBurst() {
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.5 },
  });
}

export default function StudyTracker({
  userId,
  logs,
  subjects,
  streak,
  onLogAdded,
}: StudyTrackerProps) {
  const [subject, setSubject] = useState(subjects[0]?.name ?? "");
  const [minutes, setMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const [timerSubject, setTimerSubject] = useState(subjects[0]?.name ?? "");
  const [plannedHours, setPlannedHours] = useState(2);
  const [actualHours, setActualHours] = useState(0);
  const [celebrations, setCelebrations] = useState<ActiveCelebration[]>([]);
  const [, setTick] = useState(0);

  const sessionsRef = useRef<TimerSession[]>([]);

  useEffect(() => {
    if (subjects.length > 0) {
      if (!subjects.find((s) => s.name === subject)) {
        setSubject(subjects[0].name);
      }
      if (!subjects.find((s) => s.name === timerSubject)) {
        setTimerSubject(subjects[0].name);
      }
    }
  }, [subjects, subject, timerSubject]);

  const triggerTimerCelebration = useCallback((sessionSubject: string) => {
    const audio = new Audio("/sounds/celebration.mp3");
    audio.play().catch(() => {});
    fireConfettiBurst();

    const id = crypto.randomUUID();
    setCelebrations((prev) => [...prev, { id, subject: sessionSubject }]);
    setTimeout(() => {
      setCelebrations((prev) => prev.filter((c) => c.id !== id));
    }, 10000);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;

      sessionsRef.current = sessionsRef.current.map((session) => {
        if (session.completed) {
          if (session.displayActualHours < session.plannedHours) {
            changed = true;
            return {
              ...session,
              displayActualHours: Math.min(
                session.plannedHours,
                session.displayActualHours + session.plannedHours / 20
              ),
            };
          }
          return session;
        }

        const remaining = getRemainingSeconds(session);
        if (remaining <= 0) {
          changed = true;
          const updated = {
            ...session,
            completed: true,
            displayActualHours: session.actualHours,
          };

          if (!session.celebrated) {
            updated.celebrated = true;
            triggerTimerCelebration(session.subject);
          }

          return updated;
        }

        return session;
      });

      if (changed || sessionsRef.current.some((s) => !s.completed)) {
        setTick((t) => t + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [triggerTimerCelebration]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || minutes <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/user/${userId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, minutes }),
      });
      const result = await res.json();
      if (res.ok) {
        onLogAdded(result.logs, result.streak);
        setMinutes(30);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleTimerAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timerSubject || plannedHours <= 0) return;

    const remainingSeconds = Math.max(
      0,
      (plannedHours - actualHours) * 3600
    );

    const session: TimerSession = {
      id: crypto.randomUUID(),
      subject: timerSubject,
      plannedHours,
      actualHours,
      startTime: Date.now(),
      initialRemainingSeconds: remainingSeconds,
      completed: remainingSeconds <= 0,
      displayActualHours: actualHours,
      celebrated: false,
    };

    if (remainingSeconds <= 0 && !session.celebrated) {
      session.celebrated = true;
      session.displayActualHours = actualHours;
      triggerTimerCelebration(timerSubject);
    }

    sessionsRef.current = [...sessionsRef.current, session];
    setTick((t) => t + 1);
    setActualHours(0);
  };

  const sessions = sessionsRef.current;
  const recentLogs = [...logs].reverse().slice(0, 5);

  const chartLabels = sessions.map((s) => s.subject);
  const chartPlanned = sessions.map((s) => s.plannedHours);
  const chartActual = sessions.map((s) =>
    s.completed ? s.plannedHours : s.displayActualHours
  );

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Planned (hours)",
        data: chartPlanned,
        backgroundColor: "rgba(2, 132, 199, 0.7)",
        borderRadius: 4,
      },
      {
        label: "Actual (hours)",
        data: chartActual,
        backgroundColor: sessions.map((s) =>
          s.completed
            ? "rgba(16, 185, 129, 0.95)"
            : "rgba(16, 185, 129, 0.7)"
        ),
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: sessions.some((s) => s.completed) ? 800 : 400,
    },
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Planned vs Actual Study Hours",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Hours" },
      },
    },
  };

  return (
    <>
      {celebrations.map((c, index) => (
        <CelebrationToast
          key={c.id}
          subject={c.subject}
          durationMs={10000}
          headline="Congratulations!"
          body={`You completed ${c.subject}!`}
          offsetTop={1 + index * 7}
          onClose={() =>
            setCelebrations((prev) => prev.filter((item) => item.id !== c.id))
          }
        />
      ))}

      <section className="card md:col-span-2">
        <h2 className="card-title">Digital Study Timer</h2>

        <form onSubmit={handleTimerAdd} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Subject</label>
            <select
              className="input"
              value={timerSubject}
              onChange={(e) => setTimerSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Planned Hours</label>
            <input
              type="number"
              min={0.5}
              step={0.5}
              className="input"
              value={plannedHours}
              onChange={(e) => setPlannedHours(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="label">Actual Studied Hours</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className="input"
              value={actualHours}
              onChange={(e) => setActualHours(Number(e.target.value) || 0)}
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full">
              Add / Upload
            </button>
          </div>
        </form>

        {sessions.length > 0 && (
          <div className="space-y-6">
            <div
              className={
                sessions.length === 1
                  ? "grid grid-cols-1"
                  : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {sessions.map((session) => {
                const remaining = getRemainingSeconds(session);
                return (
                  <div
                    key={session.id}
                    className={`rounded-xl border p-4 text-center ${
                      session.completed
                        ? "border-green-400 bg-green-50"
                        : "border-sky-200 bg-sky-50"
                    }`}
                  >
                    <p className="text-sm font-semibold text-navy">
                      {session.subject}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {session.completed
                        ? "Completed!"
                        : "Time remaining"}
                    </p>
                    <p
                      className={`mt-2 font-mono text-3xl font-bold ${
                        session.completed ? "text-green-600" : "text-accent"
                      }`}
                    >
                      {session.completed
                        ? "00:00:00"
                        : formatCountdown(remaining)}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Planned {session.plannedHours}h · Studied{" "}
                      {session.actualHours}h
                    </p>
                  </div>
                );
              })}
            </div>

            <Bar data={chartData} options={chartOptions} />
          </div>
        )}

        {sessions.length === 0 && (
          <p className="mb-6 text-sm text-slate-500">
            Add a subject with planned and actual hours to start a live countdown
            timer and comparison chart.
          </p>
        )}

        <hr className="my-6 border-slate-200" />

        <h3 className="mb-3 text-base font-bold text-navy">Study Log</h3>
        <form onSubmit={handleLogSubmit} className="mb-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Subject</label>
              <select
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Minutes Spent</label>
              <input
                type="number"
                min={1}
                className="input"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-primary w-full sm:w-auto"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Add Study Entry"}
          </button>
        </form>

        <div className="text-sm text-slate-600">
          <p>
            Current streak: <strong>{streak.current}</strong> days | Best:{" "}
            <strong>{streak.best}</strong> days
          </p>
        </div>

        {recentLogs.length > 0 && (
          <ul className="mt-3 space-y-1 text-sm text-slate-600">
            {recentLogs.map((log) => (
              <li key={log.id}>
                {log.date.slice(0, 10)} — {log.subject}: {log.minutes} min
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
