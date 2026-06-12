import type { Timetable, TimetableDay } from "./types";

export function generateTimetable(
  subjectNames: string[],
  durationDays: number,
  dailyGoalHours: number
): Timetable {
  const activeSubjects = subjectNames.filter(Boolean);
  const days: TimetableDay[] = [];

  if (activeSubjects.length === 0 || durationDays <= 0 || dailyGoalHours <= 0) {
    return { startDate: new Date().toISOString().slice(0, 10), days: [] };
  }

  for (let day = 0; day < durationDays; day += 1) {
    const subject = activeSubjects[day % activeSubjects.length];
    days.push({
      day: day + 1,
      subjects: [{ subject, hours: dailyGoalHours }],
    });
  }

  return {
    startDate: new Date().toISOString().slice(0, 10),
    days,
  };
}

export function getCurrentDayIndex(timetable: Timetable): number {
  const start = new Date(`${timetable.startDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return 0;
  if (diff >= timetable.days.length) return timetable.days.length - 1;
  return diff;
}

export function getPlannedHoursBySubject(timetable: Timetable): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const day of timetable.days) {
    for (const entry of day.subjects) {
      totals[entry.subject] = (totals[entry.subject] ?? 0) + entry.hours;
    }
  }
  return totals;
}

export function getTodayPlannedBySubject(
  timetable: Timetable
): Record<string, number> {
  const dayIndex = getCurrentDayIndex(timetable);
  const day = timetable.days[dayIndex];
  if (!day) return {};

  const result: Record<string, number> = {};
  for (const entry of day.subjects) {
    result[entry.subject] = entry.hours;
  }
  return result;
}
