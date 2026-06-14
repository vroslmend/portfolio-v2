import { NextResponse } from "next/server";

// Let Vercel's CDN serve one shared response for a few seconds, so a burst of
// visitors (or fast polling) doesn't each hit Spotify. The route still runs
// per request (the no-store fetches below keep it dynamic); this only governs
// how long the edge may reuse a response.
const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
};

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

// Spotify access tokens last ~1h. Cache it across warm invocations so we don't
// burn a token refresh on every poll — the real perf lever for this endpoint.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN ?? "",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("spotify token refresh failed");
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    // refresh a minute early so a request never rides an about-to-expire token
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

const notPlaying = () =>
  NextResponse.json({ isPlaying: false }, { headers: CACHE_HEADERS });

export async function GET() {
  if (!process.env.SPOTIFY_REFRESH_TOKEN) return notPlaying();

  try {
    const token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    // 204 = nothing playing right now
    if (res.status === 204) return notPlaying();
    // token rejected: drop the cache so the next poll re-refreshes
    if (res.status === 401) {
      cachedToken = null;
      return notPlaying();
    }
    if (!res.ok) return notPlaying();

    const song = (await res.json()) as {
      is_playing?: boolean;
      item?: {
        name?: string;
        artists?: { name: string }[];
        external_urls?: { spotify?: string };
      } | null;
    };

    if (!song?.is_playing || !song.item?.name) return notPlaying();

    return NextResponse.json(
      {
        isPlaying: true,
        title: song.item.name,
        artist: (song.item.artists ?? []).map((a) => a.name).join(", "),
        url: song.item.external_urls?.spotify ?? null,
      },
      { headers: CACHE_HEADERS }
    );
  } catch {
    // never leak internals; just fall back to the quiet footer
    return notPlaying();
  }
}
