export type Mode = 'classic' | 'obstacle';

export interface ScorePayload {
  nickname: string;
  score: number;
  mode: Mode;
  duration_ms: number;
  client_ts: string;
}

export interface ScoreItem {
  id: string;
  nickname: string;
  score: number;
  mode: Mode;
  duration_ms: number;
  created_at: string;
}

export interface LeaderboardResponse {
  items: ScoreItem[];
  total: number;
}

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function submitScore(payload: ScorePayload): Promise<ScoreItem> {
  const response = await fetch(`${API_BASE}/api/v1/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseJson<ScoreItem>(response);
}

export async function fetchLeaderboard(mode: Mode, limit = 50): Promise<LeaderboardResponse> {
  const url = new URL(`${API_BASE}/api/v1/leaderboard`);
  url.searchParams.set('mode', mode);
  url.searchParams.set('limit', String(limit));
  const response = await fetch(url);
  return parseJson<LeaderboardResponse>(response);
}
