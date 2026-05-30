import Link from "next/link";
import { notFound } from "next/navigation";

import { MatchList } from "@/components/match-list";
import { WatchView } from "@/components/watch-view";
import { getAllMatches, getMatchById, getStreamUrl } from "@/lib/rapidapi";

export const revalidate = 15;

type WatchPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

  const [match, matches, streamUrl] = await Promise.all([
    getMatchById(id),
    getAllMatches(),
    getStreamUrl(id).catch(() => null),
  ]);

  if (!match) notFound();

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
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {!streamUrl ? (
          <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
            Stream link unavailable for this match. It may have ended or the
            provider is temporarily down.
          </div>
        ) : (
          <WatchView match={match} streamUrl={streamUrl} />
        )}

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:hidden">
          <MatchList matches={matches} activeMatchId={id} />
        </section>
      </main>
    </div>
  );
}
