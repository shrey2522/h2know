import type { UserData } from "./types";
import { getSubjectsForConfig } from "./subjects";

export function createSampleData(): UserData {
  const streamData = {
    educationLevel: "Class 12" as const,
    stream: "Science" as const,
    degreeType: "B.Sc",
    btechBranch: "CSE" as const,
    professionalProgram: "CA" as const,
    professionalLevel: "Foundation" as const,
    researchArea: "",
    subjects: getSubjectsForConfig({
      educationLevel: "Class 12",
      stream: "Science",
      degreeType: "B.Sc",
      btechBranch: "CSE",
      professionalProgram: "CA",
      professionalLevel: "Foundation",
      researchArea: "",
    }),
  };

  const subjects = streamData.subjects.map((s) => {
    const marksMap: Record<string, number> = {
      Physics: 78,
      Chemistry: 82,
      Mathematics: 88,
      Biology: 75,
      English: 80,
      "Computer Science": 85,
      Hindi: 72,
    };
    return { ...s, marks: marksMap[s.name] ?? 70 };
  });

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  return {
    streamData: { ...streamData, subjects },
    goals: {
      careerGoal: "Software Engineer",
      shortTermGoal: "Score 90%+ in Mathematics this term",
      dailyStudyGoal: 3,
      timetableDuration: 7,
    },
    logs: [
      {
        id: "sample-1",
        subject: "Mathematics",
        minutes: 90,
        date: `${today}T10:00:00.000Z`,
      },
      {
        id: "sample-2",
        subject: "Physics",
        minutes: 60,
        date: `${today}T14:00:00.000Z`,
      },
      {
        id: "sample-3",
        subject: "Chemistry",
        minutes: 45,
        date: `${yesterday}T16:00:00.000Z`,
      },
    ],
    streak: { current: 2, best: 5 },
    timetable: {
      startDate: today,
      days: [
        { day: 1, subjects: [{ subject: "Physics", hours: 3 }] },
        { day: 2, subjects: [{ subject: "Chemistry", hours: 3 }] },
        { day: 3, subjects: [{ subject: "Mathematics", hours: 3 }] },
        { day: 4, subjects: [{ subject: "Biology", hours: 3 }] },
        { day: 5, subjects: [{ subject: "English", hours: 3 }] },
        { day: 6, subjects: [{ subject: "Computer Science", hours: 3 }] },
        { day: 7, subjects: [{ subject: "Hindi", hours: 3 }] },
      ],
    },
    lastInsight: null,
  };
}

export const SAMPLE_USER_ID = "H2KNOW-102";
