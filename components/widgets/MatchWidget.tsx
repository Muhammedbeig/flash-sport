"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { ChevronDown, ChevronUp, User } from "lucide-react";

// === CONSTANTS ===
const SPORT_HOSTS: Record<string, string> = {
  football: "v3.football.api-sports.io",
  basketball: "v1.basketball.api-sports.io",
  baseball: "v1.baseball.api-sports.io",
  hockey: "v1.hockey.api-sports.io",
  rugby: "v1.rugby.api-sports.io",
  nba: "v1.basketball.api-sports.io",
  nfl: "v1.american-football.api-sports.io",
  f1: "v1.formula-1.api-sports.io",
  mma: "v1.mma.api-sports.io",
};

// === TYPES ===
type Player = {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
};

type Lineup = {
  team: { id: number; name: string; logo: string };
  coach: { id: number; name: string; photo: string };
  formation: string;
  startXI: { player: Player }[];
  substitutes: { player: Player }[];
};

// === HELPER: Expandable Wrapper ===
function ExpandableWidget({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border flex flex-col">
      <div className="p-4 border-b theme-border font-bold text-sm text-secondary uppercase tracking-wider">
        {title}
      </div>

      <div
        className={`transition-all duration-500 ease-in-out relative ${
          isExpanded ? "max-h-[3000px]" : "max-h-[400px] overflow-hidden"
        }`}
      >
        {children}

        {/* Gradient Fade using Theme Variable to avoid "Blackish" look */}
        {!isExpanded && (
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: `linear-gradient(to top, rgb(var(--background)), transparent)`,
            }}
          />
        )}
      </div>

      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex items-center justify-center gap-1 py-2 text-xs font-medium text-primary border-t theme-border hover:bg-primary/5"
      >
        {isExpanded ? (
          <>
            <ChevronUp size={14} />
            Show less
          </>
        ) : (
          <>
            <ChevronDown size={14} />
            Show more
          </>
        )}
      </button>
    </div>
  );
}

// === LINEUPS COMPONENT: Hybrid Lineups ===
function MatchLineups({
  matchId,
  sport,
  widgetTheme,
}: {
  matchId: string | number;
  sport: string;
  widgetTheme: string;
}) {
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [useWidgetFallback, setUseWidgetFallback] = useState(false);
  const { theme } = useTheme();
  const matchIdStr = String(matchId);

  useEffect(() => {
    async function fetchLineups() {
      // 1. Only Football supports the custom lineup structure well
      if (sport !== "football") {
        setUseWidgetFallback(true);
        setLoading(false);
        return;
      }

      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

        let url = "";
        let headers: Record<string, string> = {};

        // 2. Use CDN if available, otherwise direct API
        if (cdnUrl) {
          url = `${cdnUrl}/fixtures/lineups?fixture=${matchIdStr}`;
        } else {
          if (!apiKey) throw new Error("No API Key");
          const host = SPORT_HOSTS.football;
          url = `https://${host}/fixtures/lineups?fixture=${matchIdStr}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();

        // 3. Check Data: If response has data, use Custom UI. If empty, use Widget Fallback.
        if (json.response && json.response.length > 0) {
          setLineups(json.response);
        } else {
          setUseWidgetFallback(true);
        }
      } catch (e) {
        console.warn("Lineup fetch failed, falling back to widget", e);
        setUseWidgetFallback(true);
      } finally {
        setLoading(false);
      }
    }
    fetchLineups();
  }, [matchId, sport]);

  const openPlayer = (playerId: number) => {
    const repoName = process.env.NEXT_PUBLIC_REPO_NAME;
    const basePath = repoName ? `/${repoName}` : "";
    window.open(
      `${basePath}/player?id=${playerId}&sport=${sport}`,
      "_blank",
    );
  };

  // WIDGET FALLBACK: if not football or no data, use native widget.
  if (useWidgetFallback) {
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
    const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
    const cdnConfig = cdnUrl ? `data-url-football="${cdnUrl}"` : "";
    const keyConfig = !cdnUrl && apiKey ? `data-key="${apiKey}"` : "";

    return (
      <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border">
        <div className="p-4 border-b theme-border font-bold text-sm text-secondary uppercase tracking-wider">
          Lineups
        </div>
        <div className="p-4">
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <api-sports-widget
                  data-type="game"
                  data-game-id="${matchIdStr}"
                  data-sport="${sport}"
                  data-theme="${widgetTheme}"
                  data-game-tab="lineups"
                  data-show-toolbar="false"
                  data-show-errors="false"
                  ${cdnConfig}
                  ${keyConfig}
                ></api-sports-widget>
              `,
            }}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="theme-bg rounded-xl shadow-sm border theme-border p-4 space-y-3">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (!lineups.length) return null;

  return (
    <div className="theme-bg rounded-xl shadow-sm border theme-border overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4">
        <h2 className="text-sm font-bold text-secondary uppercase tracking-wide">
          Lineups
        </h2>

        {/* Note about clickability */}
        <p className="mt-1 text-[11px] text-muted-foreground">
          Tap on any player row to open full details in a new tab.
        </p>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {lineups.map((teamLineup) => {
          const coachBg =
            theme === "dark" ? "bg-slate-900/60" : "bg-slate-50";
          const headerBg =
            theme === "dark" ? "bg-slate-900/80" : "bg-blue-50";

          return (
            <div
              key={teamLineup.team.id}
              className="flex flex-col gap-3 border theme-border rounded-xl p-3"
            >
              {/* Team Header */}
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${headerBg}`}
              >
                <img
                  src={teamLineup.team.logo}
                  alt={teamLineup.team.name}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h3 className="font-bold text-primary">
                    {teamLineup.team.name}
                  </h3>
                  <span
                    className={`text-xs text-secondary font-mono inline-block px-1.5 py-0.5 rounded ${coachBg}`}
                  >
                    {teamLineup.formation}
                  </span>
                </div>
              </div>

              {/* Coach */}
              {teamLineup.coach?.id && (
                <div
                  className={`mb-6 flex items-center gap-3 p-3 rounded-lg border theme-border ${coachBg}`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0 text-secondary">
                    {teamLineup.coach.photo ? (
                      <img
                        src={teamLineup.coach.photo}
                        alt={teamLineup.coach.name}
                      />
                    ) : (
                      <User size={16} />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Coach
                    </div>
                    <div className="text-sm font-medium text-secondary">
                      {teamLineup.coach.name}
                    </div>
                  </div>
                </div>
              )}

              {/* Start XI */}
              <div>
                <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                  Starting XI
                </div>
                <div className="space-y-1.5">
                  {teamLineup.startXI.map(({ player }) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => openPlayer(player.id)}
                      className="w-full text-left group flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                    >
                      <span className="w-6 text-[11px] font-bold text-primary">
                        {player.number}
                      </span>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-secondary group-hover:text-primary">
                          {player.name}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {player.pos}
                          {player.grid ? ` • ${player.grid}` : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Substitutes */}
              {teamLineup.substitutes?.length > 0 && (
                <div className="mt-4">
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                    Substitutes
                  </div>
                  <div className="space-y-1">
                    {teamLineup.substitutes.map(({ player }) => (
                      <button
                        key={player.id}
                        type="button"
                        onClick={() => openPlayer(player.id)}
                        className="w-full text-left group flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <span className="w-6 text-[11px] font-semibold text-secondary">
                          {player.number}
                        </span>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-secondary group-hover:text-primary">
                            {player.name}
                          </div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {player.pos}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// === MAIN MATCH WIDGET ===
export default function MatchWidget({
  matchId,
  sport = "football",
}: {
  matchId: string | number;
  sport?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [meta, setMeta] = useState<{
    leagueId?: string;
    season?: string;
    h2h?: string;
  }>({});
  const { theme } = useTheme();
  const matchIdStr = String(matchId);

  // FIX: Using Custom Themes defined in globals.css
  const widgetTheme = theme === "dark" ? "flash-dark" : "flash-light";

  // 1. Fetch Metadata (League/Season for Standings, Teams for H2H)
  useEffect(() => {
    async function init() {
      // Metadata fetching is prioritized for Football to power the H2H/Standings
      if (sport !== "football") {
        setLoaded(true);
        return;
      }

      const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
      const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

      try {
        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl}/fixtures?id=${matchIdStr}`;
        } else {
          if (!apiKey) {
            setLoaded(true);
            return;
          }
          const host = SPORT_HOSTS.football;
          url = `https://${host}/fixtures?id=${matchIdStr}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();
        const data = json.response?.[0];

        if (data) {
          const homeId = data.teams?.home?.id;
          const awayId = data.teams?.away?.id;
          setMeta({
            leagueId: data.league?.id,
            season: data.league?.season,
            h2h: homeId && awayId ? `${homeId}-${awayId}` : undefined,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoaded(true);
      }
    }

    init();
  }, [matchId, sport]);

  // 2. Load Scripts
  useEffect(() => {
    // Ensure the script isn't loaded multiple times
    if (document.querySelector('script[src*="widgets.api-sports.io"]')) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://widgets.api-sports.io/3.1.0/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // We usually don't remove it to keep widgets working,
      // but if you ever needed cleanup you could do it here.
    };
  }, []);

  // Helper: get the right ID attribute based on sport
  const getIdAttribute = () => {
    if (sport === "football") return `data-game-id="${matchIdStr}"`;
    if (sport === "basketball" || sport === "nba")
      return `data-game-id="${matchIdStr}"`;
    if (sport === "baseball") return `data-game-id="${matchIdStr}"`;
    if (sport === "hockey") return `data-game-id="${matchIdStr}"`;
    if (sport === "rugby") return `data-game-id="${matchIdStr}"`;
    if (sport === "nfl") return `data-game-id="${matchIdStr}"`;
    if (sport === "f1") return `data-race-id="${matchIdStr}"`;
    if (sport === "mma") return `data-fight-id="${matchIdStr}"`;
    return `data-game-id="${matchIdStr}"`;
  };

  // CDN Logic for widgets
  const cdnUrlFootball = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
  const cdnUrlOther = process.env.NEXT_PUBLIC_CDN_OTHER_URL;
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

  const cdnAttr = (() => {
    if (sport === "football" && cdnUrlFootball)
      return `data-url-football="${cdnUrlFootball}"`;
    if (sport !== "football" && cdnUrlOther)
      return `data-url-${sport}="${cdnUrlOther}"`;
    return "";
  })();

  const keyAttr = !cdnAttr && apiKey ? `data-key="${apiKey}"` : "";

  if (!loaded) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div key={matchIdStr} className="flex flex-col gap-8 animate-in fade-in duration-300">
      {/* 1. MAIN MATCH WIDGET (top tabs: Match / Report / Odds / etc. controlled by widget itself) */}
      <div className="theme-bg rounded-xl overflow-hidden shadow-sm border theme-border">
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <api-sports-widget
                data-type="game"
                ${getIdAttribute()}
                data-sport="${sport}"
                data-theme="${widgetTheme}"
                data-show-toolbar="true"
                data-show-errors="false"
                ${cdnAttr}
                ${keyAttr}
              ></api-sports-widget>
            `,
          }}
        />
      </div>

      {/* 2. EXTRA: STANDINGS & H2H TABS FOR FOOTBALL ONLY (reuse your existing "match" style tabs) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* H2H */}
        {meta.h2h && (
          <ExpandableWidget title="Head-to-Head">
            <div
              dangerouslySetInnerHTML={{
                __html: `
                  <api-sports-widget
                    data-type="h2h"
                    data-h2h="${meta.h2h}"
                    data-sport="football"
                    data-theme="${widgetTheme}"
                    data-show-toolbar="false"
                    data-show-errors="false"
                    ${cdnUrlFootball ? `data-url-football="${cdnUrlFootball}"` : ""}
                    ${!cdnUrlFootball && apiKey ? `data-key="${apiKey}"` : ""}
                  ></api-sports-widget>
                `,
              }}
            />
          </ExpandableWidget>
        )}

        {/* Standings */}
        {meta.leagueId && meta.season && (
          <ExpandableWidget title="Standings">
            <div
              dangerouslySetInnerHTML={{
                __html: `
                  <api-sports-widget
                    data-type="standings"
                    data-league="${meta.leagueId}"
                    data-season="${meta.season}"
                    data-sport="football"
                    data-theme="${widgetTheme}"
                    data-show-toolbar="false"
                    data-show-errors="false"
                    ${cdnUrlFootball ? `data-url-football="${cdnUrlFootball}"` : ""}
                    ${!cdnUrlFootball && apiKey ? `data-key="${apiKey}"` : ""}
                  ></api-sports-widget>
                `,
              }}
            />
          </ExpandableWidget>
        )}
      </div>

      {/* 3. LINEUPS */}
      <MatchLineups
        matchId={matchId}
        sport={sport}
        widgetTheme={widgetTheme}
      />
    </div>
  );
}
