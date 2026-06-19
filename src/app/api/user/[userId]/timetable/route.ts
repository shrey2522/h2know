import { NextResponse } from "next/server";
import { assertValidUserId } from "@/lib/userId";
import { loadUserData, saveTimetable } from "@/lib/userData";
import { generateTimetable } from "@/lib/timetable";
import { getSubjectsForConfig, mergeSubjectMarks } from "@/lib/subjects";

export async function POST(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertValidUserId(params.userId);
    const data = await loadUserData(params.userId);
    
    // Always get fresh subjects based on current stream configuration
    // This ensures we use Commerce subjects if Commerce is selected
    const freshSubjects = getSubjectsForConfig(data.streamData);
    
    // Merge with saved marks
    const subjectsWithMarks = mergeSubjectMarks(data.streamData, data.streamData.subjects)
      .filter((s) => s.category === "core" || s.marks > 0)
      .map((s) => ({ name: s.name, marks: s.marks }));

    // If no subjects have marks, use all subjects with default marks of 70
    const subjects = subjectsWithMarks.length > 0
      ? subjectsWithMarks
      : freshSubjects.map((s) => ({ name: s.name, marks: 70 }));

    const timetable = generateTimetable(
      subjects,
      data.goals.timetableDuration
    );

    const saved = await saveTimetable(params.userId, timetable);
    return NextResponse.json(saved);
  } catch (err) {
    console.error("Timetable generation error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
