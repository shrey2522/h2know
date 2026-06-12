import { NextResponse } from "next/server";
import { assertValidUserId } from "@/lib/userId";
import { updateGoals } from "@/lib/userData";
import type { Goals } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertValidUserId(params.userId);
    const goals = (await request.json()) as Goals;
    const updated = await updateGoals(params.userId, goals);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
