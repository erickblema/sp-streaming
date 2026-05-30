import {
  dedupeMatches,
  isFootballMatch,
  mapApiMatch,
} from "./match-id";
import type {
  FootballMatch,
  MatchesApiResponse,
  StreamServer,
} from "./types";

const RAPIDAPI_HOST = "football-live-streaming-api.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

function getHeaders(): HeadersInit {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY is not configured");
  }

  return {
    "Content-Type": "application/json",
    "x-rapidapi-host": RAPIDAPI_HOST,
    "x-rapidapi-key": apiKey,
  };
}

async function rapidFetch<T>(path: string, revalidate = 30): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
    next: { revalidate },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `RapidAPI ${path} failed (${response.status}): ${body || response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

async function fetchMatchesPage(
  page: number,
  status: "live" | "vs",
): Promise<MatchesApiResponse> {
  const params = new URLSearchParams({
    page: String(page),
    status,
    type: "direct",
  });

  return rapidFetch<MatchesApiResponse>(`/matches?${params.toString()}`);
}

async function fetchAllByStatus(status: "live" | "vs"): Promise<FootballMatch[]> {
  const firstPage = await fetchMatchesPage(1, status);
  const matches = firstPage.matches.map(mapApiMatch);

  for (let page = 2; page <= firstPage.pagination.totalPages; page += 1) {
    const nextPage = await fetchMatchesPage(page, status);
    matches.push(...nextPage.matches.map(mapApiMatch));
  }

  return dedupeMatches(matches.filter(isFootballMatch));
}

export async function getAllMatches(): Promise<FootballMatch[]> {
  const [live, upcoming] = await Promise.all([
    fetchAllByStatus("live"),
    fetchAllByStatus("vs"),
  ]);

  return dedupeMatches([...live, ...upcoming]);
}

export async function getLiveMatches(): Promise<FootballMatch[]> {
  return fetchAllByStatus("live");
}

export async function getMatchById(id: string): Promise<FootballMatch | null> {
  const matches = await getAllMatches();
  return matches.find((match) => match.id === id) ?? null;
}

export function getPlayableServers(match: FootballMatch): StreamServer[] {
  const direct = match.servers.filter((server) => server.type === "direct");
  const referer = match.servers.filter((server) => server.type === "referer");

  if (direct.length > 0) return direct;
  if (referer.length > 0) return referer;
  return match.servers.filter((server) => server.type !== "drm");
}

export async function getStreamUrl(matchId: string): Promise<string> {
  const match = await getMatchById(matchId);

  if (!match || getPlayableServers(match).length === 0) {
    throw new Error("No playable stream servers for this match");
  }

  return `/api/hls/${matchId}`;
}

export function isLiveMatch(match: FootballMatch): boolean {
  return match.status.toLowerCase() === "live";
}

export {
  dedupeMatches,
  isFootballLeague,
  isFootballMatch,
} from "./match-id";
