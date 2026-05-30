import type { FootballMatch, MatchesResponse, StreamResponse } from "./types";

const RAPIDAPI_HOST = "football-live-stream-api.p.rapidapi.com";
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

export async function getAllMatches(): Promise<FootballMatch[]> {
  const data = await rapidFetch<MatchesResponse>("/all-match");
  return data.result ?? [];
}

export async function getMatchById(id: string): Promise<FootballMatch | null> {
  const matches = await getAllMatches();
  return matches.find((match) => match.id === id) ?? null;
}

export async function getStreamUrl(matchId: string): Promise<string> {
  const data = await rapidFetch<StreamResponse>(`/link/${matchId}`, 0);
  return resolvePlaybackUrl(data.url);
}

export function resolvePlaybackUrl(apiUrl: string): string {
  try {
    const parsed = new URL(apiUrl);
    const encoded = parsed.searchParams.get("url");

    if (encoded) {
      return Buffer.from(encoded, "base64").toString("utf-8");
    }
  } catch {
    // Fall through to raw URL when parsing fails.
  }

  return apiUrl;
}

export function isLiveMatch(match: FootballMatch): boolean {
  return match.status.toLowerCase() === "live";
}
