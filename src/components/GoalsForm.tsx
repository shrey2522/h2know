"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Goals } from "@/lib/types";

interface GoalsFormProps {
  userId: string;
  goals: Goals;
  onUpdate: (goals: Goals) => void;
}

export default function GoalsForm({ userId, goals, onUpdate }: GoalsFormProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (updated: Goals) => {
      fetch(`/api/user/${userId}/goals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).then((res) => res.json()).then(onUpdate);
    },
    [userId, onUpdate]
  );

  const debouncedSave = useCallback(
    (updated: Goals) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(updated), 500);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const update = (patch: Partial<Goals>) => {
    const updated = { ...goals, ...patch };
    onUpdate(updated);
    debouncedSave(updated);
  };

  return (
    <section className="card">
      <h2 className="card-title">Goals</h2>
      <div className="space-y-3">
        <div>
          <label className="label">Career Goal</label>
          <input
            className="input"
            value={goals.careerGoal}
            placeholder="e.g. Software Engineer"
            onChange={(e) => update({ careerGoal: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Short-Term Goal</label>
          <input
            className="input"
            value={goals.shortTermGoal}
            placeholder="e.g. Score 90% in Maths"
            onChange={(e) => update({ shortTermGoal: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Daily Study Goal (hours)</label>
            <input
              type="number"
              min={1}
              max={12}
              className="input"
              value={goals.dailyStudyGoal}
              onChange={(e) =>
                update({ dailyStudyGoal: Number(e.target.value) || 1 })
              }
            />
          </div>
          <div>
            <label className="label">Timetable Duration (days)</label>
            <input
              type="number"
              min={1}
              max={30}
              className="input"
              value={goals.timetableDuration}
              onChange={(e) =>
                update({ timetableDuration: Number(e.target.value) || 7 })
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
