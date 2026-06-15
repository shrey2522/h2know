"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  BACHELOR_DEGREES,
  BTECH_BRANCHES,
  EDUCATION_LEVELS,
  getProfessionalLevels,
  MASTER_DEGREES,
  mergeSubjectMarks,
  PROFESSIONAL_PROGRAMS,
  STREAMS,
} from "@/lib/subjects";
import type {
  BTechBranch,
  EducationLevel,
  MasterDegree,
  ProfessionalLevel,
  ProfessionalProgram,
  Stream,
  StreamData,
} from "@/lib/types";

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
      })
        .then((res) => res.json())
        .then(onUpdate);
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

  const applyConfig = (patch: Partial<StreamData>, immediate = true) => {
    const merged = { ...streamData, ...patch };
    const next: StreamData = {
      ...merged,
      subjects: mergeSubjectMarks(merged, streamData.subjects),
    };
    onUpdate(next);
    if (immediate) save(next);
    else debouncedSave(next);
  };

  const handleEducationChange = (educationLevel: EducationLevel) => {
    const patch: Partial<StreamData> = { educationLevel };
    if (educationLevel === "Class 11" || educationLevel === "Class 12") {
      patch.stream = streamData.stream ?? "Science";
    }
    applyConfig(patch);
  };

  const handleStreamChange = (stream: Stream) => {
    applyConfig({ stream });
  };

  const handleDegreeChange = (degreeType: string) => {
    applyConfig({ degreeType });
  };

  const handleBranchChange = (btechBranch: BTechBranch) => {
    applyConfig({ btechBranch });
  };

  const handleProfessionalProgramChange = (professionalProgram: ProfessionalProgram) => {
    const levels = getProfessionalLevels(professionalProgram);
    applyConfig({
      professionalProgram,
      professionalLevel: levels[0],
    });
  };

  const handleProfessionalLevelChange = (professionalLevel: ProfessionalLevel) => {
    applyConfig({ professionalLevel });
  };

  const handleResearchAreaChange = (researchArea: string) => {
    const merged = { ...streamData, researchArea };
    const updated: StreamData = {
      ...merged,
      subjects: mergeSubjectMarks(merged, streamData.subjects),
    };
    onUpdate(updated);
    debouncedSave(updated);
  };

  const handleMarksChange = (name: string, marks: number) => {
    const updated = {
      ...streamData,
      subjects: streamData.subjects.map((s) =>
        s.name === name
          ? { ...s, marks: Math.min(100, Math.max(0, marks)) }
          : s
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

  const isClassLevel =
    streamData.educationLevel === "Class 11" ||
    streamData.educationLevel === "Class 12";

  const profLevels = getProfessionalLevels(streamData.professionalProgram);

  return (
    <section className="card">
      <h2 className="card-title">Education &amp; Subjects</h2>

      <label className="label">Education Level</label>
      <select
        className="input mb-4"
        value={streamData.educationLevel}
        onChange={(e) =>
          handleEducationChange(e.target.value as EducationLevel)
        }
      >
        {EDUCATION_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>

      {isClassLevel && (
        <>
          <label className="label">Stream</label>
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
        </>
      )}

      {streamData.educationLevel === "Bachelor's Degree" && (
        <>
          <label className="label">Degree Program</label>
          <select
            className="input mb-4"
            value={streamData.degreeType}
            onChange={(e) => handleDegreeChange(e.target.value)}
          >
            {BACHELOR_DEGREES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {streamData.degreeType === "B.Tech/B.E" && (
            <>
              <label className="label">Branch</label>
              <select
                className="input mb-4"
                value={streamData.btechBranch}
                onChange={(e) =>
                  handleBranchChange(e.target.value as BTechBranch)
                }
              >
                {BTECH_BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </>
          )}
        </>
      )}

      {streamData.educationLevel === "Master's Degree" && (
        <>
          <label className="label">Degree Program</label>
          <select
            className="input mb-4"
            value={streamData.degreeType}
            onChange={(e) =>
              handleDegreeChange(e.target.value as MasterDegree)
            }
          >
            {MASTER_DEGREES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </>
      )}

      {streamData.educationLevel === "Professional Degree" && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Program</label>
            <select
              className="input"
              value={streamData.professionalProgram}
              onChange={(e) =>
                handleProfessionalProgramChange(
                  e.target.value as ProfessionalProgram
                )
              }
            >
              {PROFESSIONAL_PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Level</label>
            <select
              className="input"
              value={streamData.professionalLevel}
              onChange={(e) =>
                handleProfessionalLevelChange(
                  e.target.value as ProfessionalLevel
                )
              }
            >
              {profLevels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {streamData.educationLevel === "PhD" && (
        <div className="mb-4">
          <label className="label">Research Area / Subject</label>
          <input
            className="input"
            value={streamData.researchArea}
            placeholder="e.g. Machine Learning in Healthcare"
            onChange={(e) => handleResearchAreaChange(e.target.value)}
          />
        </div>
      )}

      {(["core", "optional", "extra"] as const).map((category) =>
        grouped[category].length > 0 ? (
          <div key={category} className="mb-4">
            <h3 className="mb-2 text-sm font-semibold capitalize text-slate-600">
              {category === "core" && !isClassLevel
                ? "Subjects"
                : `${category} Subjects`}
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
                      handleMarksChange(
                        subject.name,
                        Number(e.target.value) || 0
                      )
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
