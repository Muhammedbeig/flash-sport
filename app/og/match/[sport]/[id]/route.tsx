import { ImageResponse } from "next/og";

export const runtime = "edge";
export const revalidate = 300;

function normalizeSport(raw?: string) {
  const s = (raw || "football").toLowerCase();
  if (s === "soccer") return "football";
  if (s === "ice-hockey") return "hockey";
  if (s === "american-football") return "nfl";
  return s;
}

const SPORT_API: Record<string, { host: string; path: string }> = {
  football: { host: "v3.football.api-sports.io", path: "fixtures" },
  basketball: { host: "v1.basketball.api-sports.io", path: "games" },
  baseball: { host: "v1.baseball.api-sports.io", path: "games" },
  hockey: { host: "v1.hockey.api-sports.io", path: "games" },
  nfl: { host: "v1.american-football.api-sports.io", path: "games" },
  rugby: { host: "v1.rugby.api-sports.io", path: "games" },
  volleyball: { host: "v1.volleyball.api-sports.io", path: "games" },
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sport: string; id: string }> }
) {
  const { sport: sportRaw, id } = await params;
  const sport = normalizeSport(sportRaw);
  const cfg = SPORT_API[sport];

  const apiKey = process.env.API_SPORTS_KEY || process.env.NEXT_PUBLIC_API_SPORTS_KEY;

  let home = "Match";
  let away = `#${id}`;
  let homeLogo: string | null = null;
  let awayLogo: string | null = null;
  let score = "";

  try {
    if (cfg && apiKey) {
      const url = `https://${cfg.host}/${cfg.path}?id=${encodeURIComponent(id)}&timezone=UTC`;

      // NOTE: no `next:` here => avoids TS overload issues in route handlers
      const res = await fetch(url, {
        headers: {
          "x-apisports-key": apiKey,
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": cfg.host,
        },
        cache: "force-cache",
      });

      const json = await res.json();
      const item = json?.response?.[0];

      if (item) {
        const core = item.fixture || item.game || item;
        const teams = item.teams || core.teams || {};
        const homeRaw = teams.home || teams.local || {};
        const awayRaw = teams.away || teams.visitors || teams.visitor || {};

        home = homeRaw.name || home;
        away = awayRaw.name || away;
        homeLogo = homeRaw.logo || null;
        awayLogo = awayRaw.logo || null;

        const scoresRaw = item.goals || item.scores || item.score || {};
        const hs =
          typeof scoresRaw?.home?.total !== "undefined"
            ? Number(scoresRaw.home.total)
            : typeof scoresRaw?.home !== "undefined"
            ? Number(scoresRaw.home)
            : null;

        const as =
          typeof scoresRaw?.away?.total !== "undefined"
            ? Number(scoresRaw.away.total)
            : typeof scoresRaw?.away !== "undefined"
            ? Number(scoresRaw.away)
            : typeof scoresRaw?.visitors?.total !== "undefined"
            ? Number(scoresRaw.visitors.total)
            : typeof scoresRaw?.visitors !== "undefined"
            ? Number(scoresRaw.visitors)
            : null;

        if (typeof hs === "number" && typeof as === "number") score = `${hs} - ${as}`;
      }
    }
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "48px",
          background: "linear-gradient(135deg, #0b1220 0%, #111827 60%, #0b1220 100%)",
          color: "white",
          fontFamily: "Inter, system-ui, Arial",
        }}
      >
        <div style={{ fontSize: 26, opacity: 0.9, marginBottom: 18 }}>
          LiveSoccerR • Soccer Scores. Right Now.
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {homeLogo ? (
              <img src={homeLogo} width={90} height={90} style={{ objectFit: "contain" }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: 14, background: "rgba(255,255,255,0.08)" }} />
            )}
            <div style={{ fontSize: 44, fontWeight: 800 }}>{home}</div>
          </div>

          <div style={{ fontSize: 44, fontWeight: 800, opacity: 0.9 }}>vs</div>

          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontSize: 44, fontWeight: 800 }}>{away}</div>
            {awayLogo ? (
              <img src={awayLogo} width={90} height={90} style={{ objectFit: "contain" }} />
            ) : (
              <div style={{ width: 90, height: 90, borderRadius: 14, background: "rgba(255,255,255,0.08)" }} />
            )}
          </div>
        </div>

        <div style={{ marginTop: 26, fontSize: 34, opacity: 0.95 }}>
          {score ? `LIVE SCORE: ${score}` : "LIVE SCORE • LINEUPS • STATS"}
        </div>

        <div style={{ marginTop: 18, fontSize: 20, opacity: 0.75 }}>
          /match/{sport}/{id}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
