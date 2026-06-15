import type {
  BTechBranch,
  BachelorDegree,
  EducationLevel,
  MasterDegree,
  ProfessionalLevel,
  ProfessionalProgram,
  Stream,
  StreamData,
  SubjectMark,
} from "./types";
import { DEFAULT_STREAM_DATA } from "./types";

export const EDUCATION_LEVELS: EducationLevel[] = [
  "Class 11",
  "Class 12",
  "Bachelor's Degree",
  "Master's Degree",
  "Professional Degree",
  "PhD",
];

export const STREAMS: Stream[] = ["Science", "Commerce", "Arts"];

export const BACHELOR_DEGREES: BachelorDegree[] = [
  "B.Sc",
  "B.Com",
  "B.A",
  "B.Tech/B.E",
  "BBA",
  "BCA",
  "MBBS / BDS",
  "LLB",
];

export const BTECH_BRANCHES: BTechBranch[] = [
  "CSE",
  "ECE",
  "Mechanical",
  "Civil",
];

export const MASTER_DEGREES: MasterDegree[] = [
  "M.Sc",
  "M.Com",
  "M.A",
  "M.Tech/M.E",
  "MBA",
  "MCA",
  "LLM",
  "MD/MS",
];

export const PROFESSIONAL_PROGRAMS: ProfessionalProgram[] = ["CA", "CS", "CMA"];

export const PROFESSIONAL_LEVELS: ProfessionalLevel[] = [
  "Foundation",
  "Intermediate",
  "Executive",
  "Professional",
  "Final",
];

const CLASS_STREAM_SUBJECTS: Record<
  Stream,
  { core: string[]; optional: string[]; extra: string[] }
> = {
  Science: {
    core: ["Physics", "Chemistry", "Mathematics", "Biology", "English"],
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

const BACHELOR_SUBJECTS: Record<BachelorDegree, string[]> = {
  "B.Sc": [
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biology",
    "Computer Science",
    "Statistics",
    "Electronics",
  ],
  "B.Com": [
    "Financial Accounting",
    "Business Law",
    "Economics",
    "Taxation",
    "Auditing",
    "Cost Accounting",
  ],
  "B.A": [
    "History",
    "Political Science",
    "Sociology",
    "Psychology",
    "Geography",
    "Literature",
    "Philosophy",
  ],
  "B.Tech/B.E": [
    "Engineering Maths",
    "Data Structures",
    "Algorithms",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
  ],
  BBA: [
    "Management",
    "Marketing",
    "Finance",
    "Human Resources",
    "Business Communication",
  ],
  BCA: [
    "Programming",
    "Data Structures",
    "Web Development",
    "Networking",
    "Mathematics",
  ],
  "MBBS / BDS": [
    "Anatomy",
    "Physiology",
    "Biochemistry",
    "Pathology",
    "Pharmacology",
    "Surgery",
  ],
  LLB: [
    "Constitutional Law",
    "Criminal Law",
    "Contract Law",
    "Civil Procedure",
    "Property Law",
  ],
};

const BTECH_BRANCH_SUBJECTS: Record<BTechBranch, string[]> = {
  CSE: ["Machine Learning", "Compiler Design", "Cloud Computing"],
  ECE: ["Digital Electronics", "Signal Processing", "VLSI Design"],
  Mechanical: ["Thermodynamics", "Fluid Mechanics", "Machine Design"],
  Civil: ["Structural Analysis", "Surveying", "Construction Management"],
};

const MASTER_SUBJECTS: Record<MasterDegree, string[]> = {
  "M.Sc": [
    "Advanced Physics",
    "Advanced Chemistry",
    "Advanced Mathematics",
    "Research Methods",
    "Laboratory Techniques",
  ],
  "M.Com": [
    "Advanced Accounting",
    "Financial Management",
    "Business Research",
    "Corporate Law",
    "Econometrics",
  ],
  "M.A": [
    "Advanced Theory",
    "Research Methodology",
    "Seminar Paper",
    "Dissertation",
    "Contemporary Studies",
  ],
  "M.Tech/M.E": [
    "Advanced Algorithms",
    "Thesis Research",
    "Specialization Elective",
    "Technical Writing",
    "Innovation & Design",
  ],
  MBA: [
    "Strategic Management",
    "Financial Analytics",
    "Marketing Strategy",
    "Operations Management",
    "Leadership",
  ],
  MCA: [
    "Advanced Programming",
    "Software Architecture",
    "Big Data",
    "Cyber Security",
    "Project Management",
  ],
  LLM: [
    "International Law",
    "Corporate Law",
    "Intellectual Property",
    "Legal Research",
    "Dissertation",
  ],
  "MD/MS": [
    "Clinical Medicine",
    "Advanced Pathology",
    "Surgical Techniques",
    "Patient Care",
    "Medical Research",
  ],
};

const PROFESSIONAL_SUBJECTS: Record<
  ProfessionalProgram,
  Partial<Record<ProfessionalLevel, string[]>>
> = {
  CA: {
    Foundation: [
      "Principles of Accounting",
      "Business Laws",
      "Quantitative Aptitude",
      "Business Economics",
    ],
    Intermediate: [
      "Advanced Accounting",
      "Corporate Laws",
      "Cost Accounting",
      "Taxation",
      "Auditing",
    ],
    Final: [
      "Financial Reporting",
      "Strategic Financial Management",
      "Advanced Auditing",
      "Direct Tax Laws",
      "Indirect Tax Laws",
    ],
  },
  CS: {
    Foundation: [
      "Business Environment",
      "Business Management",
      "Business Economics",
      "Fundamentals of Accounting",
    ],
    Executive: [
      "Company Law",
      "Cost & Management Accounting",
      "Economic & Labour Laws",
      "Tax Laws",
    ],
    Professional: [
      "Governance, Risk & Compliance",
      "Secretarial Audit",
      "Corporate Restructuring",
      "Drafting & Appearances",
    ],
  },
  CMA: {
    Foundation: [
      "Fundamentals of Economics",
      "Fundamentals of Accounting",
      "Fundamentals of Laws",
      "Fundamentals of Business Mathematics",
    ],
    Intermediate: [
      "Financial Accounting",
      "Laws & Ethics",
      "Direct Taxation",
      "Cost Accounting",
    ],
    Final: [
      "Corporate Financial Reporting",
      "Strategic Cost Management",
      "Direct Tax Laws",
      "Indirect Tax Laws",
    ],
  },
};

const PHD_CORE_SUBJECTS = [
  "Research Methodology",
  "Literature Review",
  "Thesis Writing",
  "Statistical Analysis",
];

function toSubjectMarks(
  names: string[],
  category: SubjectMark["category"] = "core"
): SubjectMark[] {
  return names.map((name) => ({ name, marks: 0, category }));
}

function classStreamSubjects(stream: Stream): SubjectMark[] {
  const set = CLASS_STREAM_SUBJECTS[stream];
  return [
    ...toSubjectMarks(set.core, "core"),
    ...toSubjectMarks(set.optional, "optional"),
    ...toSubjectMarks(set.extra, "extra"),
  ];
}

export function getSubjectsForConfig(
  config: Pick<
    StreamData,
    | "educationLevel"
    | "stream"
    | "degreeType"
    | "btechBranch"
    | "professionalProgram"
    | "professionalLevel"
    | "researchArea"
  >
): SubjectMark[] {
  const level = config.educationLevel ?? "Class 12";

  if (level === "Class 11" || level === "Class 12") {
    return classStreamSubjects(config.stream ?? "Science");
  }

  if (level === "Bachelor's Degree") {
    const degree = (config.degreeType as BachelorDegree) || "B.Sc";
    const base = BACHELOR_SUBJECTS[degree] ?? BACHELOR_SUBJECTS["B.Sc"];
    const subjects = toSubjectMarks(base, "core");
    if (degree === "B.Tech/B.E") {
      const branch = config.btechBranch ?? "CSE";
      subjects.push(...toSubjectMarks(BTECH_BRANCH_SUBJECTS[branch], "optional"));
    }
    return subjects;
  }

  if (level === "Master's Degree") {
    const degree = (config.degreeType as MasterDegree) || "M.Sc";
    return toSubjectMarks(MASTER_SUBJECTS[degree] ?? MASTER_SUBJECTS["M.Sc"]);
  }

  if (level === "Professional Degree") {
    const program = config.professionalProgram ?? "CA";
    const profLevel = config.professionalLevel ?? "Foundation";
    const subjects =
      PROFESSIONAL_SUBJECTS[program]?.[profLevel] ??
      PROFESSIONAL_SUBJECTS.CA.Foundation ??
      [];
    return toSubjectMarks(subjects);
  }

  if (level === "PhD") {
    const subjects = toSubjectMarks(PHD_CORE_SUBJECTS);
    if (config.researchArea?.trim()) {
      subjects.unshift({
        name: config.researchArea.trim(),
        marks: 0,
        category: "core",
      });
    }
    return subjects;
  }

  return classStreamSubjects("Science");
}

/** @deprecated Use getSubjectsForConfig */
export function getSubjectsForStream(stream: Stream): SubjectMark[] {
  return classStreamSubjects(stream);
}

export function mergeSubjectMarks(
  config: StreamData,
  existing: SubjectMark[]
): SubjectMark[] {
  const defaults = getSubjectsForConfig(config);
  const markMap = new Map(existing.map((s) => [s.name, s.marks]));

  return defaults.map((subject) => ({
    ...subject,
    marks: markMap.get(subject.name) ?? subject.marks,
  }));
}

export function normalizeStreamData(
  data: Partial<StreamData> & { stream?: Stream; subjects?: SubjectMark[] }
): StreamData {
  const educationLevel = data.educationLevel ?? "Class 12";
  const stream = data.stream ?? "Science";

  const normalized: StreamData = {
    educationLevel,
    stream,
    degreeType: data.degreeType ?? DEFAULT_STREAM_DATA.degreeType,
    btechBranch: data.btechBranch ?? DEFAULT_STREAM_DATA.btechBranch,
    professionalProgram:
      data.professionalProgram ?? DEFAULT_STREAM_DATA.professionalProgram,
    professionalLevel:
      data.professionalLevel ?? DEFAULT_STREAM_DATA.professionalLevel,
    researchArea: data.researchArea ?? "",
    subjects: data.subjects ?? [],
  };

  normalized.subjects = mergeSubjectMarks(normalized, normalized.subjects);
  return normalized;
}

export function getProfessionalLevels(
  program: ProfessionalProgram
): ProfessionalLevel[] {
  const levels = PROFESSIONAL_SUBJECTS[program];
  return Object.keys(levels) as ProfessionalLevel[];
}

export function getEducationLabel(data: StreamData): string {
  if (data.educationLevel === "Class 11" || data.educationLevel === "Class 12") {
    return `${data.educationLevel} — ${data.stream}`;
  }
  if (data.educationLevel === "Bachelor's Degree") {
    const branch =
      data.degreeType === "B.Tech/B.E" ? ` (${data.btechBranch})` : "";
    return `${data.educationLevel} — ${data.degreeType}${branch}`;
  }
  if (data.educationLevel === "Master's Degree") {
    return `${data.educationLevel} — ${data.degreeType}`;
  }
  if (data.educationLevel === "Professional Degree") {
    return `${data.professionalProgram} — ${data.professionalLevel}`;
  }
  if (data.educationLevel === "PhD") {
    return data.researchArea
      ? `PhD — ${data.researchArea}`
      : "PhD / Doctoral";
  }
  return data.educationLevel;
}
