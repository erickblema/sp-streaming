export type MatchStatus = "Live" | "Upcoming" | "Finished" | string;

export interface FootballMatch {
  id: string;
  league: string;
  home_name: string;
  away_name: string;
  home_flag: string;
  away_flag: string;
  date: string;
  time: string;
  status: MatchStatus;
  score: string;
  kickoff: string;
  currentMinutes: number | null;
}

export interface MatchesResponse {
  result: FootballMatch[];
}

export interface StreamResponse {
  url: string;
}
