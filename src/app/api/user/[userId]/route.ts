import { NextResponse } from "next/server";
import { assertValidUserId } from "@/lib/userId";
import { loadUserData } from "@/lib/userData";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    assertValidUserId(params.userId);
    const data = await loadUserData(params.userId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
