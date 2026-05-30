import { createHash } from "crypto";

import type { ApiMatch, FootballMatch } from "./types";

export function createMatchId(match: ApiMatch): string {
  const raw = [
    match.match_time,
    match.league_name,
    match.home_team_name,
    match.away_team_name,
  ].join("|");

  return createHash("sha256").update(raw).digest("base64url").slice(0, 22);
}

export function mapApiMatch(match: ApiMatch): FootballMatch {
  const kickoff = new Date(Number(match.match_time) * 1000);

  return {
    id: createMatchId(match),
    league: match.league_name,
    home_name: match.home_team_name,
    away_name: match.away_team_name,
    home_flag: match.home_team_logo,
    away_flag: match.away_team_logo,
    date: Number.isNaN(kickoff.getTime())
      ? ""
      : kickoff.toISOString().slice(0, 10),
    time: Number.isNaN(kickoff.getTime())
      ? ""
      : kickoff.toISOString().slice(11, 19),
    status: match.match_status,
    score: `${match.homeTeamScore} - ${match.awayTeamScore}`,
    kickoff: Number.isNaN(kickoff.getTime()) ? "" : kickoff.toISOString(),
    currentMinutes: null,
    servers: match.servers ?? [],
  };
}

const NON_FOOTBALL_LEAGUE_PATTERNS = [
  /\bwnba\b/i,
  /\bnba\b/i,
  /\bnfl\b/i,
  /\bnhl\b/i,
  /\bmlb\b/i,
  /\bufc\b/i,
  /\bmma\b/i,
  /\bboxing\b/i,
  /\btennis\b/i,
  /\bcricket\b/i,
  /\bvolleyball\b/i,
  /\bhandball\b/i,
  /\bsnooker\b/i,
  /\bdarts\b/i,
  /\bformula\s*1\b/i,
  /\bf1\b/i,
  /\bgolf\b/i,
  /\besports?\b/i,
  /\bbasketball\b/i,
  /\bice hockey\b/i,
  /\bamerican football\b/i,
];

export function isFootballLeague(leagueName: string): boolean {
  const league = leagueName.trim();
  if (!league) return true;

  return !NON_FOOTBALL_LEAGUE_PATTERNS.some((pattern) => pattern.test(league));
}

export function isFootballMatch(match: FootballMatch): boolean {
  return isFootballLeague(match.league);
}

export function dedupeMatches(matches: FootballMatch[]): FootballMatch[] {
  const byId = new Map<string, FootballMatch>();

  for (const match of matches) {
    const existing = byId.get(match.id);

    if (!existing) {
      byId.set(match.id, match);
      continue;
    }

    const preferLive =
      match.status.toLowerCase() === "live" &&
      existing.status.toLowerCase() !== "live"
        ? match
        : existing;

    const other = preferLive === match ? existing : match;
    const mergedServers = [...preferLive.servers, ...other.servers];
    const seen = new Set<string>();

    byId.set(match.id, {
      ...preferLive,
      servers: mergedServers.filter((server) => {
        if (seen.has(server.url)) return false;
        seen.add(server.url);
        return true;
      }),
    });
  }

  return Array.from(byId.values());
}
