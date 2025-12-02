// lib/apiClient.ts

/**
 * Build URL + headers for API-Sports requests.
 *
 * If a CDN pull zone is set (NEXT_PUBLIC_CDN_<SPORT>_URL):
 *  - Fetch via CDN
 *  - No headers needed (Bunny injects key automatically)
 *
 * Otherwise:
 *  - Fetch via official API host
 *  - Add RapidAPI headers
 */

export function buildApiRequest(
  sport: string,
  endpointPath: string,
  params?: URLSearchParams
): {
  url: string;
  headers: Record<string, string>; // <-- FIXED
  viaCDN: boolean;
} {
  const env = process.env as any;

  // Map CDN URLs based on sport
  const CDN_MAP: Record<string, string | undefined> = {
    football: env.NEXT_PUBLIC_CDN_FOOTBALL_URL,
    basketball: env.NEXT_PUBLIC_CDN_BASKETBALL_URL,
    baseball: env.NEXT_PUBLIC_CDN_BASEBALL_URL,
    hockey: env.NEXT_PUBLIC_CDN_HOCKEY_URL,
    rugby: env.NEXT_PUBLIC_CDN_RUGBY_URL,
    nfl: env.NEXT_PUBLIC_CDN_NFL_URL,
    volleyball: env.NEXT_PUBLIC_CDN_VOLLEYBALL_URL,
  };

  // Official API hosts (per documentation)
  const HOST_MAP: Record<string, string> = {
    football: "v3.football.api-sports.io",
    basketball: "v1.basketball.api-sports.io",
    baseball: "v1.baseball.api-sports.io",
    hockey: "v1.hockey.api-sports.io",
    rugby: "v1.rugby.api-sports.io",
    nfl: "v1.american-football.api-sports.io",
    volleyball: "v1.volleyball.api-sports.io",
  };

  // Clean endpoint path
  endpointPath = endpointPath.replace(/^\/+/, "");

  const qs = params ? `?${params.toString()}` : "";

  const cdnUrl = CDN_MAP[sport];

  // ---------------------------------------------------
  // ✔ CDN MODE — NO HEADERS REQUIRED
  // ---------------------------------------------------
  if (cdnUrl && cdnUrl.trim() !== "") {
    return {
      url: `${cdnUrl.replace(/\/+$/, "")}/${endpointPath}${qs}`,
      headers: {}, // <--- MUST BE EMPTY OBJECT (HeadersInit OK)
      viaCDN: true,
    };
  }

  // ---------------------------------------------------
  // ✔ DIRECT API MODE — ADD REQUIRED HEADERS
  // ---------------------------------------------------
  const host = HOST_MAP[sport] || HOST_MAP.football;
  const apiKey = env.NEXT_PUBLIC_API_SPORTS_KEY || "";

  return {
    url: `https://${host}/${endpointPath}${qs}`,
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey,
    }, // <--- PLAIN OBJECT (completely valid HeadersInit)
    viaCDN: false,
  };
}
