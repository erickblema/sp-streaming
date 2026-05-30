import Link from "next/link";

import { MatchList } from "@/components/match-list";
import { getAllMatches } from "@/lib/rapidapi";
import type { FootballMatch } from "@/lib/types";

export const revalidate = 30;

export default async function HomePage() {
  let matches: FootballMatch[] = [];
  let error: string | null = null;

  try {
    matches = await getAllMatches();
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Unable to load matches right now.";
  }

  const liveCount = matches.filter((m) => m.status.toLowerCase() === "live").length;

  return (
    <div className="min-h-screen bg-[#070b09] text-white">
      <header className="border-b border-white/10 bg-[#070b09]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-black">
              SS
            </span>
            <div>
              <p className="font-semibold tracking-tight">SportStream</p>
              <p className="text-xs text-zinc-500">Live football streams</p>
            </div>
          </Link>
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            {liveCount} live now
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Watch live football
          </h1>
          <p className="mt-3 text-zinc-400">
            Browse live fixtures, pick a match, and stream instantly in your
            browser with adaptive HLS playback.
          </p>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
            {!process.env.RAPIDAPI_KEY && (
              <p className="mt-2 text-red-300">
                Add your RapidAPI key to <code>.env.local</code> as{" "}
                <code>RAPIDAPI_KEY</code>.
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:max-h-[calc(100vh-12rem)] lg:overflow-hidden">
              <MatchList matches={matches} />
            </aside>

            <section className="flex min-h-[420px] flex-col justify-center rounded-2xl border border-dashed border-white/10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_55%)] p-8 text-center">
              <p className="text-lg font-medium text-white">
                Select a match to start watching
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
                Use the sidebar to filter live games or search by league and
                team name.
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
