"use client";

import { useEffect, useState } from "react";
import type { StreakData, StudyLog, SubjectMark } from "@/lib/types";

interface StudyTrackerProps {
  userId: string;
  logs: StudyLog[];
  subjects: SubjectMark[];
  streak: StreakData;
  onLogAdded: (logs: StudyLog[], streak: StreakData) => void;
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

  useEffect(() => {
    if (subjects.length > 0 && !subjects.find((s) => s.name === subject)) {
      setSubject(subjects[0].name);
    }
  }, [subjects, subject]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  const recentLogs = [...logs].reverse().slice(0, 5);

  return (
    <section className="card">
      <h2 className="card-title">Study Tracker</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-3">
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
        <button type="submit" className="btn-primary w-full" disabled={submitting}>
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
  );
}
