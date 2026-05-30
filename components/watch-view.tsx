import Link from "next/link";

import type { FootballMatch } from "@/lib/types";
import { isLiveMatch } from "@/lib/rapidapi";

import { LivePlayer } from "./live-player";
import { TeamFlag } from "./team-flag";

type WatchViewProps = {
  match: FootballMatch;
  streamUrl: string;
};

export function WatchView({ match, streamUrl }: WatchViewProps) {
  const live = isLiveMatch(match);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-6">
        <LivePlayer
          src={streamUrl}
          title={`${match.home_name} vs ${match.away_name}`}
        />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-zinc-400">{match.league}</p>
            {live && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                Live
              </span>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <TeamBlock name={match.home_name} flag={match.home_flag} align="end" />
            <div className="text-center">
              <p className="text-3xl font-bold tabular-nums tracking-tight text-white">
                {match.score}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {match.currentMinutes != null
                  ? `${match.currentMinutes} min`
                  : new Date(match.kickoff).toLocaleString()}
              </p>
            </div>
            <TeamBlock name={match.away_name} flag={match.away_flag} align="start" />
          </div>
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to all matches
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-400">
          <p className="font-medium text-white">Stream info</p>
          <p className="mt-2 leading-relaxed">
            Streams are delivered as HLS (.m3u8). If playback fails, the source
            may have ended or geo-restricted the feed — try another live match.
          </p>
        </div>
      </aside>
    </div>
  );
}

function TeamBlock({
  name,
  flag,
  align,
}: {
  name: string;
  flag: string;
  align: "start" | "end";
}) {
  return (
    <div
      className={`flex items-center gap-3 ${
        align === "end" ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <TeamFlag name={name} flag={flag} size={48} />
      <p className="font-semibold text-white">{name}</p>
    </div>
  );
}
