import type { StreakData } from "@/lib/types";

interface HeaderProps {
  userId: string;
  streak: StreakData;
}

export default function Header({ userId, streak }: HeaderProps) {
  return (
    <header className="bg-navy px-4 py-6 text-white shadow-lg lg:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-accent-light">
            H2Know
          </h1>
          <p className="text-sm text-slate-300">
            Drink Smarter with H2Know
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="rounded-full bg-white/10 px-3 py-1">
            ID: {userId}
          </span>
          <span className="rounded-full bg-accent px-3 py-1">
            🔥 Streak: {streak.current} days
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1">
            Best: {streak.best} days
          </span>
        </div>
      </div>
    </header>
  );
}
