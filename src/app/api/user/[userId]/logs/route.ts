import { NextResponse } from "next/server";
import { assertValidUserId } from "@/lib/userId";
import { addStudyLog } from "@/lib/userData";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertValidUserId(params.userId);
    const body = await request.json();
    const { subject, minutes } = body as { subject: string; minutes: number };

    if (!subject || !minutes || minutes <= 0) {
      return NextResponse.json({ error: "Invalid log entry" }, { status: 400 });
    }

    const result = await addStudyLog(params.userId, {
      subject,
      minutes: Number(minutes),
      date: new Date().toISOString(),
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
