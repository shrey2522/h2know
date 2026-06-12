import { NextResponse } from "next/server";
import { assertValidUserId } from "@/lib/userId";
import { updateStreamData } from "@/lib/userData";
import type { StreamData } from "@/lib/types";

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertValidUserId(params.userId);
    const streamData = (await request.json()) as StreamData;
    const updated = await updateStreamData(params.userId, streamData);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
