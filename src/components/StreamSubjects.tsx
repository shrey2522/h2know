"use client";

import { useCallback, useEffect, useRef } from "react";
import { getSubjectsForStream, STREAMS } from "@/lib/subjects";
import type { Stream, StreamData } from "@/lib/types";

interface StreamSubjectsProps {
  userId: string;
  streamData: StreamData;
  onUpdate: (data: StreamData) => void;
}

export default function StreamSubjects({
  userId,
  streamData,
  onUpdate,
}: StreamSubjectsProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    (data: StreamData) => {
      fetch(`/api/user/${userId}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()).then(onUpdate);
    },
    [userId, onUpdate]
  );

  const debouncedSave = useCallback(
    (data: StreamData) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(data), 500);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleStreamChange = (stream: Stream) => {
    const subjects = getSubjectsForStream(stream);
    const updated = { stream, subjects };
    onUpdate(updated);
    save(updated);
  };

  const handleMarksChange = (name: string, marks: number) => {
    const updated = {
      ...streamData,
      subjects: streamData.subjects.map((s) =>
        s.name === name ? { ...s, marks: Math.min(100, Math.max(0, marks)) } : s
      ),
    };
    onUpdate(updated);
    debouncedSave(updated);
  };

  const grouped = {
    core: streamData.subjects.filter((s) => s.category === "core"),
    optional: streamData.subjects.filter((s) => s.category === "optional"),
    extra: streamData.subjects.filter((s) => s.category === "extra"),
  };

  return (
    <section className="card">
      <h2 className="card-title">Stream &amp; Subjects</h2>
      <label className="label">Select Stream</label>
      <select
        className="input mb-4"
        value={streamData.stream}
        onChange={(e) => handleStreamChange(e.target.value as Stream)}
      >
        {STREAMS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {(["core", "optional", "extra"] as const).map((category) =>
        grouped[category].length > 0 ? (
          <div key={category} className="mb-4">
            <h3 className="mb-2 text-sm font-semibold capitalize text-slate-600">
              {category} Subjects
            </h3>
            <div className="space-y-2">
              {grouped[category].map((subject) => (
                <div
                  key={subject.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-sm text-slate-700">{subject.name}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="input w-24 text-right"
                    value={subject.marks || ""}
                    placeholder="Marks"
                    onChange={(e) =>
                      handleMarksChange(subject.name, Number(e.target.value) || 0)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </section>
  );
}
