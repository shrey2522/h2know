import type { StudyLog, StreakData } from "./types";

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function uniqueSortedDates(logs: StudyLog[]): string[] {
  const dates = new Set(logs.map((log) => toDateKey(log.date)));
  return Array.from(dates).sort();
}

export function calculateStreak(logs: StudyLog[]): StreakData {
  if (logs.length === 0) {
    return { current: 0, best: 0 };
  }

  const dates = uniqueSortedDates(logs);
  const dateSet = new Set(dates);

  let best = 0;
  let run = 0;
  let prev: Date | null = null;

  for (const dateStr of dates) {
    const current = new Date(`${dateStr}T00:00:00`);
    if (prev) {
      const diffDays = Math.round(
        (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        run += 1;
      } else {
        run = 1;
      }
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = current;
  }

  const today = toDateKey(new Date().toISOString());
  const yesterday = toDateKey(
    new Date(Date.now() - 86400000).toISOString()
  );

  let current = 0;
  if (dateSet.has(today) || dateSet.has(yesterday)) {
    const start = dateSet.has(today) ? today : yesterday;
    current = 1;
    let cursor = new Date(`${start}T00:00:00`);

    while (true) {
      const prevDay = new Date(cursor.getTime() - 86400000);
      const prevKey = toDateKey(prevDay.toISOString());
      if (dateSet.has(prevKey)) {
        current += 1;
        cursor = prevDay;
      } else {
        break;
      }
    }
  }

  return { current, best: Math.max(best, current) };
}

export function sumMinutesBySubject(
  logs: StudyLog[],
  subject: string,
  dateKey?: string
): number {
  return logs
    .filter(
      (log) =>
        log.subject === subject &&
        (dateKey ? toDateKey(log.date) === dateKey : true)
    )
    .reduce((sum, log) => sum + log.minutes, 0);
}

export function sumMinutesBySubjectToday(
  logs: StudyLog[],
  subject: string
): number {
  return sumMinutesBySubject(logs, subject, toDateKey(new Date().toISOString()));
}

export function todayKey(): string {
  return toDateKey(new Date().toISOString());
}
