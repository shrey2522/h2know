export type Stream = "Science" | "Commerce" | "Arts";

export interface SubjectMark {
  name: string;
  marks: number;
  category: "core" | "optional" | "extra";
}

export interface Goals {
  careerGoal: string;
  shortTermGoal: string;
  dailyStudyGoal: number;
  timetableDuration: number;
}

export interface StudyLog {
  id: string;
  subject: string;
  minutes: number;
  date: string;
}

export interface TimetableDaySubject {
  subject: string;
  hours: number;
}

export interface TimetableDay {
  day: number;
  subjects: TimetableDaySubject[];
}

export interface Timetable {
  startDate: string;
  days: TimetableDay[];
}

export interface StreakData {
  current: number;
  best: number;
}

export interface StreamData {
  stream: Stream;
  subjects: SubjectMark[];
}

export interface AIInsight {
  careerSuggestion: string;
  reasoning: string;
  studyInsight: string;
  progressSummary: string;
  generatedAt: string;
}

export interface UserData {
  streamData: StreamData;
  goals: Goals;
  logs: StudyLog[];
  streak: StreakData;
  timetable: Timetable | null;
  lastInsight: AIInsight | null;
}

export const DEFAULT_GOALS: Goals = {
  careerGoal: "",
  shortTermGoal: "",
  dailyStudyGoal: 3,
  timetableDuration: 7,
};

export const DEFAULT_STREAM_DATA: StreamData = {
  stream: "Science",
  subjects: [],
};
