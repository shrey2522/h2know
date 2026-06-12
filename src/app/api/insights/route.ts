import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { fallbackInsight } from "@/lib/insights-fallback";
import { assertValidUserId } from "@/lib/userId";
import { saveInsight } from "@/lib/userData";
import type { AIInsight, Goals, Stream, StudyLog, SubjectMark } from "@/lib/types";

export const dynamic = "force-dynamic";

interface InsightRequest {
  userId: string;
  stream: Stream;
  subjects: SubjectMark[];
  studyLogs: StudyLog[];
  goals: Goals;
}

function buildPrompt(payload: InsightRequest): string {
  const marksText = payload.subjects
    .map((s) => `${s.name}: ${s.marks}/100`)
    .join(", ");

  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const recentLogs = payload.studyLogs.filter(
    (log) => new Date(log.date).getTime() >= sevenDaysAgo
  );

  const logsSummary =
    recentLogs.length > 0
      ? recentLogs
          .map(
            (log) =>
              `${log.date.slice(0, 10)} — ${log.subject}: ${log.minutes} min`
          )
          .join("; ")
      : "No study logs in the last 7 days";

  return `You are a friendly academic advisor for an Indian high school student.

Student's stream: ${payload.stream}
Subject marks: ${marksText}
Daily study goal: ${payload.goals.dailyStudyGoal} hours
Recent study logs (last 7 days): ${logsSummary}
Career goal stated by student: ${payload.goals.careerGoal || "Not specified"}

Based on this data:
1. Suggest ONE career path that best fits their strongest subjects (be specific, e.g. "Chartered Accountant", "Software Engineer", "Doctor")
2. Give a 2-3 sentence reason why, referencing their actual marks
3. Give a short, encouraging insight about their study habits (mention if they're on track, falling behind, or doing great — be specific using their log data)
4. One actionable tip for tomorrow

Respond ONLY in this JSON format:
{"careerSuggestion": "...", "reasoning": "...", "studyInsight": "...", "tip": "..."}`;
}

function parseGeminiJson(text: string): {
  careerSuggestion: string;
  reasoning: string;
  studyInsight: string;
  tip?: string;
  progressSummary?: string;
} | null {
  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function respondWithFallback(body: InsightRequest, message: string) {
  const fallback = fallbackInsight(
    body.stream,
    body.subjects,
    body.studyLogs,
    body.goals
  );
  const insight: AIInsight = {
    ...fallback,
    generatedAt: new Date().toISOString(),
  };
  await saveInsight(body.userId, insight);
  return NextResponse.json({
    ...insight,
    fallback: true,
    message,
  });
}

export async function POST(request: Request) {
  let body: InsightRequest;

  try {
    body = (await request.json()) as InsightRequest;
    assertValidUserId(body.userId);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return respondWithFallback(
      body,
      "AI insights temporarily unavailable — showing rule-based suggestions."
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(buildPrompt(body));
    const text = result.response.text();
    const parsed = parseGeminiJson(text);

    if (!parsed) {
      throw new Error("Failed to parse Gemini response");
    }

    const insight: AIInsight = {
      careerSuggestion: parsed.careerSuggestion,
      reasoning: parsed.reasoning,
      studyInsight: parsed.studyInsight,
      progressSummary: parsed.tip ?? parsed.progressSummary ?? "",
      generatedAt: new Date().toISOString(),
    };

    await saveInsight(body.userId, insight);
    return NextResponse.json(insight);
  } catch {
    return respondWithFallback(
      body,
      "AI insights temporarily unavailable — try again later."
    );
  }
}
