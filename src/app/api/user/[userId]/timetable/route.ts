import { NextResponse } from "next/server";
import { assertValidUserId } from "@/lib/userId";
import { loadUserData, saveTimetable } from "@/lib/userData";
import { generateTimetable } from "@/lib/timetable";

export async function POST(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertValidUserId(params.userId);
    const data = await loadUserData(params.userId);
    const subjectNames = data.streamData.subjects
      .filter((s) => s.category === "core" || s.marks > 0)
      .map((s) => s.name);

    const timetable = generateTimetable(
      subjectNames.length > 0
        ? subjectNames
        : data.streamData.subjects.map((s) => s.name),
      data.goals.timetableDuration,
      data.goals.dailyStudyGoal
    );

    const saved = await saveTimetable(params.userId, timetable);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
