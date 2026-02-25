const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8080';
async function parseJson(response) {
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Request failed (${response.status})`);
    }
    return response.json();
}
export async function submitScore(payload) {
    const response = await fetch(`${API_BASE}/api/v1/scores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });
    return parseJson(response);
}
export async function fetchLeaderboard(mode, limit = 50) {
    const url = new URL(`${API_BASE}/api/v1/leaderboard`);
    url.searchParams.set('mode', mode);
    url.searchParams.set('limit', String(limit));
    const response = await fetch(url);
    return parseJson(response);
}
