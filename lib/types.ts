export type MatchStatus = "live" | "vs" | string;

export type StreamType = "direct" | "referer" | "drm" | string;

export interface StreamServer {
  name: string;
  url: string;
  header: Record<string, string>;
  type: StreamType;
}

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
  servers: StreamServer[];
}

export interface ApiMatch {
  match_time: string;
  match_status: string;
  home_team_name: string;
  home_team_logo: string;
  homeTeamScore: string;
  away_team_name: string;
  away_team_logo: string;
  awayTeamScore: string;
  league_name: string;
  league_logo: string;
  servers: StreamServer[];
}

export interface MatchesApiResponse {
  matches: ApiMatch[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
