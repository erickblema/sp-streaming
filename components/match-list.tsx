"use client";

import { useMemo, useState } from "react";

import type { FootballMatch } from "@/lib/types";
import { isLiveMatch } from "@/lib/rapidapi";

import { MatchCard } from "./match-card";

type MatchListProps = {
  matches: FootballMatch[];
  activeMatchId?: string;
};

type Filter = "all" | "live";

export function MatchList({ matches, activeMatchId }: MatchListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("live");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return matches.filter((match) => {
      if (filter === "live" && !isLiveMatch(match)) return false;

      if (!normalizedQuery) return true;

      const haystack = [
        match.league,
        match.home_name,
        match.away_name,
        match.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [filter, matches, query]);

  const liveCount = matches.filter(isLiveMatch).length;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Matches
          </h2>
          <span className="text-xs text-zinc-500">
            {liveCount} live · {matches.length} total
          </span>
        </div>

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search league or team…"
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
        />

        <div className="flex gap-2">
          <FilterButton
            active={filter === "live"}
            onClick={() => setFilter("live")}
          >
            Live
          </FilterButton>
          <FilterButton
            active={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All
          </FilterButton>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
            No matches match your filters.
          </div>
        ) : (
          filtered.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              active={match.id === activeMatchId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-emerald-500 text-black"
          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
