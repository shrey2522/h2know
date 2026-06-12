"use client";

import { useEffect, useMemo, useRef } from "react";
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
import { sumMinutesBySubject, sumMinutesBySubjectToday } from "@/lib/streak";
import {
  getPlannedHoursBySubject,
  getTodayPlannedBySubject,
} from "@/lib/timetable";
import type { StudyLog, Timetable } from "@/lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PlannedVsActualChartProps {
  logs: StudyLog[];
  timetable: Timetable | null;
  onGoalMatched: (subject: string) => void;
}

export default function PlannedVsActualChart({
  logs,
  timetable,
  onGoalMatched,
}: PlannedVsActualChartProps) {
  const checkedRef = useRef<Set<string>>(new Set());

  const { labels, planned, actual, matched } = useMemo(() => {
    if (!timetable || timetable.days.length === 0) {
      return { labels: [], planned: [], actual: [], matched: [] as boolean[] };
    }

    const plannedMap = getPlannedHoursBySubject(timetable);
    const todayPlanned = getTodayPlannedBySubject(timetable);
    const subjects = Object.keys(plannedMap).sort();

    const plannedHours = subjects.map((s) => plannedMap[s] ?? 0);
    const actualHours = subjects.map((s) => sumMinutesBySubject(logs, s) / 60);

    const todayMatched = subjects.map((s) => {
      const todayPlan = todayPlanned[s] ?? 0;
      const todayActual = sumMinutesBySubjectToday(logs, s) / 60;
      return todayPlan > 0 && todayActual >= todayPlan;
    });

    const displayActual = subjects.map((s, i) => {
      const plan = plannedHours[i];
      const act = actualHours[i];
      return act >= plan ? plan : act;
    });

    return {
      labels: subjects,
      planned: plannedHours,
      actual: displayActual,
      matched: todayMatched,
    };
  }, [logs, timetable]);

  useEffect(() => {
    if (!timetable) return;
    const todayPlanned = getTodayPlannedBySubject(timetable);
    const today = new Date().toISOString().slice(0, 10);

    for (const subject of Object.keys(todayPlanned)) {
      const key = `${today}:${subject}`;
      if (checkedRef.current.has(key)) continue;

      const planned = todayPlanned[subject] ?? 0;
      const actual = sumMinutesBySubjectToday(logs, subject) / 60;

      if (planned > 0 && actual >= planned) {
        checkedRef.current.add(key);
        onGoalMatched(subject);
      }
    }
  }, [logs, timetable, onGoalMatched]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Planned (hours)",
        data: planned,
        backgroundColor: "rgba(2, 132, 199, 0.7)",
        borderRadius: 4,
      },
      {
        label: "Actual (hours)",
        data: actual,
        backgroundColor: "rgba(16, 185, 129, 0.7)",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "Planned vs Actual Study Hours",
      },
      tooltip: {
        callbacks: {
          afterLabel: (ctx: { dataIndex: number }) => {
            if (matched[ctx.dataIndex]) return " ✅ matched today";
            return "";
          },
        },
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
    <section className="card md:col-span-2">
      <h2 className="card-title">Planned vs Actual</h2>
      {!timetable || labels.length === 0 ? (
        <p className="text-sm text-slate-500">
          Generate a timetable to see planned vs actual study hours.
        </p>
      ) : (
        <>
          <Bar data={chartData} options={options} />
          <div className="mt-2 flex flex-wrap gap-2">
            {labels.map(
              (label, i) =>
                matched[i] && (
                  <span
                    key={label}
                    className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
                  >
                    ✅ {label} matched today
                  </span>
                )
            )}
          </div>
        </>
      )}
    </section>
  );
}
