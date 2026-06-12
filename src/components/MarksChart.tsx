"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { SubjectMark } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

interface MarksChartProps {
  subjects: SubjectMark[];
}

export default function MarksChart({ subjects }: MarksChartProps) {
  const withMarks = subjects.filter((s) => s.marks > 0);

  const chartData = {
    labels: withMarks.map((s) => s.name),
    datasets: [
      {
        label: "Marks (/100)",
        data: withMarks.map((s) => s.marks),
        backgroundColor: "rgba(2, 132, 199, 0.8)",
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Subject Marks" },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <section className="card">
      <h2 className="card-title">Marks Overview</h2>
      {withMarks.length === 0 ? (
        <p className="text-sm text-slate-500">
          Enter marks for your subjects to see this chart.
        </p>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </section>
  );
}
