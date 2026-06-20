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
const RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

// Spotify access tokens last ~1h. Cache it across warm invocations so we don't
// burn a token refresh on every poll — the real perf lever for this endpoint.
let cachedToken: { value: string; expiresAt: number } | null = null;

type SpotifyImage = { url?: string; width?: number; height?: number };
type SpotifyTrack =
  | {
      name?: string;
      artists?: { name: string }[];
      album?: { images?: SpotifyImage[] };
      external_urls?: { spotify?: string };
    }
  | null
  | undefined;

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

// Spotify returns album images largest-first; the last is the smallest. The
// About thumbnail is tiny, so grab the smallest to keep the payload light.
function smallestImage(images?: SpotifyImage[]): string | null {
  if (!images || images.length === 0) return null;
  return images[images.length - 1]?.url ?? null;
}

// One shared builder so currently-playing and recently-played return the same
// shape (the only difference is the isPlaying flag).
function trackResponse(isPlaying: boolean, track: SpotifyTrack) {
  return NextResponse.json(
    {
      isPlaying,
      title: track?.name ?? null,
      artist: (track?.artists ?? []).map((a) => a.name).join(", ") || null,
      albumArt: smallestImage(track?.album?.images),
      url: track?.external_urls?.spotify ?? null,
    },
    { headers: CACHE_HEADERS }
  );
}

const notPlaying = () =>
  NextResponse.json({ isPlaying: false }, { headers: CACHE_HEADERS });

async function fetchRecentlyPlayed(token: string) {
  const res = await fetch(RECENTLY_PLAYED_URL, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: { track?: SpotifyTrack }[] };
  const track = data.items?.[0]?.track;
  if (!track?.name) return null;
  return trackResponse(false, track);
}

export async function GET() {
  if (!process.env.SPOTIFY_REFRESH_TOKEN) return notPlaying();

  try {
    const token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    // token rejected: drop the cache so the next poll re-refreshes
    if (res.status === 401) {
      cachedToken = null;
      return notPlaying();
    }

    // actively playing a track → return it live
    if (res.ok && res.status !== 204) {
      const song = (await res.json()) as {
        is_playing?: boolean;
        item?: SpotifyTrack;
      };
      if (song?.is_playing && song.item?.name) {
        return trackResponse(true, song.item);
      }
    }

    // nothing live (204, paused, or no item) → fall back to the last track
    const recent = await fetchRecentlyPlayed(token);
    return recent ?? notPlaying();
  } catch {
    // never leak internals; just fall back to the quiet "not playing"
    return notPlaying();
  }
}
