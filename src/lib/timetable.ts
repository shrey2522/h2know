import type { Timetable, TimetableDay, SubjectMark } from "./types";

const MAX_SUBJECTS_PER_DAY = 3;
const MAX_HOURS_PER_DAY = 4;

interface SubjectWithMarks {
  name: string;
  marks: number;
}

/**
 * Generate a timetable that prioritizes weak subjects.
 * - Max 3 subjects per day
 * - Max 4 hours per day
 * - Weaker subjects get more study time
 */
export function generateTimetable(
  subjects: SubjectWithMarks[],
  durationDays: number
): Timetable {
  const activeSubjects = subjects.filter((s) => s.name);
  const days: TimetableDay[] = [];

  if (activeSubjects.length === 0 || durationDays <= 0) {
    return { startDate: new Date().toISOString().slice(0, 10), days: [] };
  }

  // Sort subjects by marks ascending (weakest first)
  const sortedSubjects = [...activeSubjects].sort((a, b) => a.marks - b.marks);

  // Calculate weight for each subject (inverse of marks - lower marks = higher weight)
  // Max marks assumed to be 100
  const totalWeight = sortedSubjects.reduce(
    (sum, s) => sum + (100 - s.marks + 20), // +20 to ensure even strong subjects get some time
    0
  );

  // Calculate hours allocation per subject based on weight
  const totalAvailableHours = durationDays * MAX_HOURS_PER_DAY;
  const subjectHours: Record<string, number> = {};

  sortedSubjects.forEach((subject) => {
    const weight = 100 - subject.marks + 20;
    const proportion = weight / totalWeight;
    // Round to nearest 0.5 hour, minimum 1 hour
    let hours = Math.round(proportion * totalAvailableHours * 2) / 2;
    hours = Math.max(1, Math.min(hours, totalAvailableHours));
    subjectHours[subject.name] = hours;
  });

  // Distribute subjects across days
  let subjectQueue = sortedSubjects.map((s) => ({
    name: s.name,
    remainingHours: subjectHours[s.name],
  }));

  for (let day = 0; day < durationDays; day++) {
    const dayEntries: { subject: string; hours: number }[] = [];
    let hoursUsedToday = 0;
    let subjectsToday = 0;

    // Pick subjects for today (prioritize those with more remaining hours)
    subjectQueue.sort((a, b) => b.remainingHours - a.remainingHours);

    for (const subject of subjectQueue) {
      if (subjectsToday >= MAX_SUBJECTS_PER_DAY) break;
      if (hoursUsedToday >= MAX_HOURS_PER_DAY) break;
      if (subject.remainingHours <= 0) continue;

      // Calculate how many hours to assign today
      const maxCanAssign = MAX_HOURS_PER_DAY - hoursUsedToday;
      const hoursToAssign = Math.min(subject.remainingHours, maxCanAssign, 2); // Max 2 hours per subject per day

      if (hoursToAssign >= 0.5) {
        dayEntries.push({ subject: subject.name, hours: hoursToAssign });
        subject.remainingHours -= hoursToAssign;
        hoursUsedToday += hoursToAssign;
        subjectsToday++;
      }
    }

    // If no subjects were assigned (all completed), restart the cycle
    if (dayEntries.length === 0) {
      // Reset remaining hours for all subjects for another cycle
      subjectQueue = sortedSubjects.map((s) => ({
        name: s.name,
        remainingHours: subjectHours[s.name],
      }));
      
      // Try again with fresh hours
      for (const subject of subjectQueue) {
        if (subjectsToday >= MAX_SUBJECTS_PER_DAY) break;
        if (hoursUsedToday >= MAX_HOURS_PER_DAY) break;

        const maxCanAssign = MAX_HOURS_PER_DAY - hoursUsedToday;
        const hoursToAssign = Math.min(subject.remainingHours, maxCanAssign, 2);

        if (hoursToAssign >= 0.5) {
          dayEntries.push({ subject: subject.name, hours: hoursToAssign });
          subject.remainingHours -= hoursToAssign;
          hoursUsedToday += hoursToAssign;
          subjectsToday++;
        }
      }
    }

    days.push({
      day: day + 1,
      subjects: dayEntries,
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
