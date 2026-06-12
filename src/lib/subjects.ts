import type { Stream, SubjectMark } from "./types";

export const STREAMS: Stream[] = ["Science", "Commerce", "Arts"];

const SUBJECT_SETS: Record<
  Stream,
  { core: string[]; optional: string[]; extra: string[] }
> = {
  Science: {
    core: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "Biology",
      "English",
    ],
    optional: ["Computer Science", "Physical Education"],
    extra: ["Hindi"],
  },
  Commerce: {
    core: [
      "Accountancy",
      "Business Studies",
      "Economics",
      "Mathematics",
      "English",
    ],
    optional: ["Informatics Practices", "Physical Education"],
    extra: ["Hindi"],
  },
  Arts: {
    core: ["History", "Political Science", "Geography", "English"],
    optional: ["Psychology", "Sociology", "Fine Arts", "Physical Education"],
    extra: ["Hindi", "Economics"],
  },
};

export function getSubjectsForStream(stream: Stream): SubjectMark[] {
  const set = SUBJECT_SETS[stream];
  return [
    ...set.core.map((name) => ({ name, marks: 0, category: "core" as const })),
    ...set.optional.map((name) => ({
      name,
      marks: 0,
      category: "optional" as const,
    })),
    ...set.extra.map((name) => ({ name, marks: 0, category: "extra" as const })),
  ];
}

export function mergeSubjectMarks(
  stream: Stream,
  existing: SubjectMark[]
): SubjectMark[] {
  const defaults = getSubjectsForStream(stream);
  const markMap = new Map(existing.map((s) => [s.name, s.marks]));

  return defaults.map((subject) => ({
    ...subject,
    marks: markMap.get(subject.name) ?? subject.marks,
  }));
}
