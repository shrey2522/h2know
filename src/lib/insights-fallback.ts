import type { SubjectMark, StudyLog, Goals, Stream } from "./types";

export function fallbackInsight(
  stream: Stream,
  subjects: SubjectMark[],
  logs: StudyLog[],
  goals: Goals
): {
  careerSuggestion: string;
  reasoning: string;
  studyInsight: string;
  progressSummary: string;
} {
  const sorted = [...subjects].sort((a, b) => b.marks - a.marks);
  const top = sorted[0];
  const careerMap: Record<string, string> = {
    Mathematics: "Software Engineer or Data Analyst",
    Physics: "Engineer or Research Scientist",
    Chemistry: "Pharmacist or Chemical Engineer",
    Biology: "Doctor or Biotechnologist",
    Accountancy: "Chartered Accountant",
    Economics: "Economist or Policy Analyst",
    History: "Civil Services or Historian",
    English: "Journalist or Content Strategist",
  };

  const careerSuggestion =
    (top && careerMap[top.name]) ||
    goals.careerGoal ||
    "Explore careers aligned with your strongest subjects";

  const reasoning = top
    ? `Your highest mark is in ${top.name} (${top.marks}/100), which suggests strong aptitude in that area.`
    : "Add your subject marks to get a more tailored career suggestion.";

  const totalMinutes = logs.reduce((sum, log) => sum + log.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const dailyTarget = goals.dailyStudyGoal;

  let studyInsight = "Start logging study sessions to track your progress.";
  if (logs.length > 0) {
    if (Number(totalHours) >= dailyTarget) {
      studyInsight = `Great work! You've logged ${totalHours} hours recently — you're meeting your daily goal of ${dailyTarget} hours.`;
    } else {
      studyInsight = `You've logged ${totalHours} hours so far. Aim for ${dailyTarget} hours daily to stay on track.`;
    }
  }

  const progressSummary =
    "Focus on your weakest subject tomorrow and review today's notes for 15 minutes before bed.";

  return { careerSuggestion, reasoning, studyInsight, progressSummary };
}
