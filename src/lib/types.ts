export type EducationLevel =
  | "Class 11"
  | "Class 12"
  | "Bachelor's Degree"
  | "Master's Degree"
  | "Professional Degree"
  | "PhD";

export type Stream = "Science" | "Commerce" | "Arts";

export type BachelorDegree =
  | "B.Sc"
  | "B.Com"
  | "B.A"
  | "B.Tech/B.E"
  | "BBA"
  | "BCA"
  | "MBBS / BDS"
  | "LLB";

export type BTechBranch = "CSE" | "ECE" | "Mechanical" | "Civil";

export type MasterDegree =
  | "M.Sc"
  | "M.Com"
  | "M.A"
  | "M.Tech/M.E"
  | "MBA"
  | "MCA"
  | "LLM"
  | "MD/MS";

export type ProfessionalProgram = "CA" | "CS" | "CMA";

export type ProfessionalLevel =
  | "Foundation"
  | "Intermediate"
  | "Executive"
  | "Professional"
  | "Final";

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
  educationLevel: EducationLevel;
  stream: Stream;
  degreeType: string;
  btechBranch: BTechBranch;
  professionalProgram: ProfessionalProgram;
  professionalLevel: ProfessionalLevel;
  researchArea: string;
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
  educationLevel: "Class 12",
  stream: "Science",
  degreeType: "B.Sc",
  btechBranch: "CSE",
  professionalProgram: "CA",
  professionalLevel: "Foundation",
  researchArea: "",
  subjects: [],
};
