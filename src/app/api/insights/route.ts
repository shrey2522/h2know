import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { fallbackInsight } from "@/lib/insights-fallback";
import { assertValidUserId } from "@/lib/userId";
import { saveInsight } from "@/lib/userData";
import type { AIInsight, Goals, Stream, StudyLog, SubjectMark } from "@/lib/types";

export const dynamic = "force-dynamic";

interface InsightRequest {
  userId: string;
  educationLabel: string;
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

  return `You are a friendly academic advisor for an Indian student.

Education level & program: ${payload.educationLabel}
Student's stream (if applicable): ${payload.stream}
Subject marks: ${marksText}
Daily study goal: ${payload.goals.dailyStudyGoal} hours
Short-term goal: ${payload.goals.shortTermGoal || "Not specified"}
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

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
] as const;

async function generateWithGemini(apiKey: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: unknown;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.error(`[insights] ${modelName} failed:`, error);
    }
  }

  throw lastError ?? new Error("All Gemini models failed");
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
    const prompt = buildPrompt(body);
    const text = await generateWithGemini(apiKey, prompt);
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
  } catch (error) {
    console.error("[insights] Gemini request failed:", error);
    return respondWithFallback(
      body,
      "AI insights temporarily unavailable — try again later."
    );
  }
}
