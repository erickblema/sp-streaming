import Link from "next/link";

import type { FootballMatch } from "@/lib/types";
import { isLiveMatch } from "@/lib/rapidapi";

import { TeamFlag } from "./team-flag";

type MatchCardProps = {
  match: FootballMatch;
  active?: boolean;
};

export function MatchCard({ match, active = false }: MatchCardProps) {
  const live = isLiveMatch(match);

  return (
    <Link
      href={`/watch/${match.id}`}
      className={`group block rounded-xl border p-4 transition ${
        active
          ? "border-emerald-500/60 bg-emerald-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-emerald-500/30 hover:bg-white/[0.06]"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-zinc-400">
          {match.league}
        </p>
        {live ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            Live
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            {match.status}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <TeamRow name={match.home_name} flag={match.home_flag} />
        <TeamRow name={match.away_name} flag={match.away_flag} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-sm">
        <span className="font-semibold tabular-nums text-white">{match.score}</span>
        <span className="text-xs text-zinc-500">
          {match.currentMinutes != null
            ? `${match.currentMinutes}'`
            : formatKickoff(match.kickoff, match.time)}
        </span>
      </div>
    </Link>
  );
}

function TeamRow({ name, flag }: { name: string; flag: string }) {
  return (
    <div className="flex items-center gap-3">
      <TeamFlag name={name} flag={flag} size={28} />
      <span className="truncate font-medium text-zinc-100">{name}</span>
    </div>
  );
}

function formatKickoff(kickoff: string, fallbackTime: string): string {
  const date = new Date(kickoff);
  if (Number.isNaN(date.getTime())) return fallbackTime;

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}
