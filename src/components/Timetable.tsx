"use client";

import { useState } from "react";
import type { Timetable as TimetableType } from "@/lib/types";

interface TimetableProps {
  userId: string;
  timetable: TimetableType | null;
  onGenerated: (timetable: TimetableType) => void;
}

export default function Timetable({
  userId,
  timetable,
  onGenerated,
}: TimetableProps) {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/user/${userId}/timetable`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) onGenerated(data);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="card md:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="card-title mb-0">Timetable</h2>
        <button
          type="button"
          className="btn-primary"
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Timetable"}
        </button>
      </div>

      {!timetable || timetable.days.length === 0 ? (
        <p className="text-sm text-slate-500">
          Set your goals and subjects, then generate a study timetable.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <p className="mb-2 text-xs text-slate-500">
            Starts: {timetable.startDate}
          </p>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                <th className="py-2 pr-4">Day</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2">Hours</th>
              </tr>
            </thead>
            <tbody>
              {timetable.days.map((day) =>
                day.subjects.map((entry, idx) => (
                  <tr key={`${day.day}-${entry.subject}`} className="border-b border-slate-100">
                    {idx === 0 && (
                      <td className="py-2 pr-4 font-medium" rowSpan={day.subjects.length}>
                        Day {day.day}
                      </td>
                    )}
                    <td className="py-2 pr-4">{entry.subject}</td>
                    <td className="py-2">{entry.hours}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
