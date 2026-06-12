import { kvGet, kvSet } from "./kv";
import { calculateStreak } from "./streak";
import { mergeSubjectMarks } from "./subjects";
import { createSampleData, SAMPLE_USER_ID } from "./sampleData";
import type {
  AIInsight,
  Goals,
  StreamData,
  StudyLog,
  StreakData,
  Timetable,
  UserData,
} from "./types";
import { DEFAULT_GOALS, DEFAULT_STREAM_DATA } from "./types";

async function loadPartial<T>(userId: string, suffix: string, fallback: T): Promise<T> {
  const value = await kvGet<T>(userId, suffix);
  return value ?? fallback;
}

export async function loadUserData(userId: string): Promise<UserData> {
  const [streamData, goals, logs, streak, timetable, lastInsight] =
    await Promise.all([
      loadPartial(userId, "streamData", DEFAULT_STREAM_DATA),
      loadPartial(userId, "goals", DEFAULT_GOALS),
      loadPartial<StudyLog[]>(userId, "logs", []),
      loadPartial<StreakData>(userId, "streak", { current: 0, best: 0 }),
      kvGet<Timetable>(userId, "timetable"),
      kvGet<AIInsight>(userId, "lastInsight"),
    ]);

  const hasAnyData =
    logs.length > 0 ||
    goals.careerGoal !== "" ||
    streamData.subjects.some((s) => s.marks > 0);

  if (!hasAnyData && userId === SAMPLE_USER_ID) {
    const sample = createSampleData();
    await saveUserData(userId, sample);
    return sample;
  }

  const computedStreak = calculateStreak(logs);

  return {
    streamData,
    goals,
    logs,
    streak: computedStreak.best >= streak.best ? computedStreak : streak,
    timetable,
    lastInsight,
  };
}

export async function saveUserData(userId: string, data: UserData): Promise<void> {
  await Promise.all([
    kvSet(userId, "streamData", data.streamData),
    kvSet(userId, "goals", data.goals),
    kvSet(userId, "logs", data.logs),
    kvSet(userId, "streak", data.streak),
    data.timetable
      ? kvSet(userId, "timetable", data.timetable)
      : Promise.resolve(),
    data.lastInsight
      ? kvSet(userId, "lastInsight", data.lastInsight)
      : Promise.resolve(),
  ]);
}

export async function updateStreamData(
  userId: string,
  streamData: StreamData
): Promise<StreamData> {
  const merged: StreamData = {
    stream: streamData.stream,
    subjects: mergeSubjectMarks(streamData.stream, streamData.subjects),
  };
  await kvSet(userId, "streamData", merged);
  return merged;
}

export async function updateGoals(userId: string, goals: Goals): Promise<Goals> {
  await kvSet(userId, "goals", goals);
  return goals;
}

export async function addStudyLog(
  userId: string,
  log: Omit<StudyLog, "id">
): Promise<{ logs: StudyLog[]; streak: StreakData }> {
  const logs = (await kvGet<StudyLog[]>(userId, "logs")) ?? [];
  const newLog: StudyLog = {
    ...log,
    id: crypto.randomUUID(),
  };
  const updatedLogs = [...logs, newLog];
  const streak = calculateStreak(updatedLogs);
  await kvSet(userId, "logs", updatedLogs);
  await kvSet(userId, "streak", streak);
  return { logs: updatedLogs, streak };
}

export async function saveTimetable(
  userId: string,
  timetable: Timetable
): Promise<Timetable> {
  await kvSet(userId, "timetable", timetable);
  return timetable;
}

export async function saveInsight(
  userId: string,
  insight: AIInsight
): Promise<AIInsight> {
  await kvSet(userId, "lastInsight", insight);
  return insight;
}
