"use client";

import { useState } from "react";
import type { AIInsight, Goals, StreamData, StudyLog } from "@/lib/types";
import { getEducationLabel } from "@/lib/subjects";

interface AIInsightsProps {
  userId: string;
  streamData: StreamData;
  studyLogs: StudyLog[];
  goals: Goals;
  lastInsight: AIInsight | null;
  onInsight: (insight: AIInsight) => void;
}

export default function AIInsights({
  userId,
  streamData,
  studyLogs,
  goals,
  lastInsight,
  onInsight,
}: AIInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          educationLabel: getEducationLabel(streamData),
          stream: streamData.stream,
          subjects: streamData.subjects,
          studyLogs,
          goals,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onInsight(data);
        if (data.message) setMessage(data.message);
      } else {
        setMessage(data.error ?? "Could not generate insights.");
      }
    } catch {
      setMessage("AI insights temporarily unavailable — try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card md:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="card-title mb-0">Career &amp; AI Insights</h2>
        <button
          type="button"
          className="btn-primary"
          onClick={generate}
          disabled={loading}
        >
          {loading
            ? "Analyzing..."
            : lastInsight
              ? "Refresh AI Insights"
              : "Generate AI Analysis"}
        </button>
      </div>

      {message && (
        <p className="mb-3 text-sm text-amber-700">{message}</p>
      )}

      {!lastInsight ? (
        <div className="ai-prompt-box">
          <p className="text-sm text-slate-600">
            Click &quot;Generate AI Analysis&quot; to get personalized career
            suggestions and study insights powered by Gemini AI.
          </p>
        </div>
      ) : (
        <div className="ai-prompt-box space-y-3">
          <div>
            <h3 className="font-semibold text-accent">Suggested Career</h3>
            <p className="text-slate-700">{lastInsight.careerSuggestion}</p>
          </div>
          <div>
            <h3 className="font-semibold text-accent">Why</h3>
            <p className="text-slate-700">{lastInsight.reasoning}</p>
          </div>
          <div>
            <h3 className="font-semibold text-accent">Study Insight</h3>
            <p className="text-slate-700">{lastInsight.studyInsight}</p>
          </div>
          <div>
            <h3 className="font-semibold text-accent">Tip for Tomorrow</h3>
            <p className="text-slate-700">{lastInsight.progressSummary}</p>
          </div>
          <p className="text-xs text-slate-400">
            Generated: {new Date(lastInsight.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </section>
  );
}
