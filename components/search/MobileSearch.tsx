"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SPORT_DEFS = {
  football: { label: "Football", host: "v3.football.api-sports.io", matchesEndpoint: "fixtures" },
  basketball: { label: "Basketball", host: "v1.basketball.api-sports.io", matchesEndpoint: "games" },
  nfl: { label: "NFL", host: "v1.american-football.api-sports.io", matchesEndpoint: "games" },
  baseball: { label: "Baseball", host: "v1.baseball.api-sports.io", matchesEndpoint: "games" },
  hockey: { label: "Hockey", host: "v1.hockey.api-sports.io", matchesEndpoint: "games" },
  rugby: { label: "Rugby", host: "v1.rugby.api-sports.io", matchesEndpoint: "games" },
  volleyball: { label: "Volleyball", host: "v1.volleyball.api-sports.io", matchesEndpoint: "games" },
} as const;

type SportId = keyof typeof SPORT_DEFS;

function safeSport(v?: string): SportId {
  const s = (v || "football").toLowerCase();
  const keys = Object.keys(SPORT_DEFS) as SportId[];
  return keys.includes(s as SportId) ? (s as SportId) : "football";
}

function buildHeaders(host: string, apiKey: string) {
  // Works for both API-SPORTS direct + RapidAPI-style configs
  return {
    "x-apisports-key": apiKey,
    "x-rapidapi-host": host,
    "x-rapidapi-key": apiKey,
  } as Record<string, string>;
}

type LeagueHit = { sport: SportId; id: number; name: string; country?: string; logo?: string };
type TeamHit = { sport: SportId; id: number; name: string; country?: string; logo?: string };
type PlayerHit = {
  sport: SportId;
  id: number;
  name: string;
  nationality?: string;
  photo?: string;
  teamName?: string;
  teamLogo?: string;
};
type MatchHit = {
  sport: SportId;
  id: number;
  date?: string;
  status?: string;
  leagueName?: string;
  leagueLogo?: string;
  homeName?: string;
  homeLogo?: string;
  awayName?: string;
  awayLogo?: string;
};

type ResultBundle = {
  leagues: LeagueHit[];
  teams: TeamHit[];
  players: PlayerHit[];
  matches: MatchHit[];
};

function asArr(v: unknown): any[] {
  return Array.isArray(v) ? v : [];
}

function normLeague(sport: SportId, item: any): LeagueHit | null {
  const league = item?.league ?? item;
  const id = Number(league?.id);
  const name = String(league?.name || "");
  if (!id || !name) return null;

  const country = item?.country?.name || item?.country || league?.country || undefined;
  const logo = league?.logo || league?.image || item?.logo || undefined;

  return { sport, id, name, country, logo };
}

function normTeam(sport: SportId, item: any): TeamHit | null {
  const team = item?.team ?? item;
  const id = Number(team?.id);
  const name = String(team?.name || "");
  if (!id || !name) return null;

  const country = item?.country?.name || item?.country || team?.country || undefined;
  const logo = team?.logo || team?.image || item?.logo || undefined;

  return { sport, id, name, country, logo };
}

function normPlayer(sport: SportId, item: any): PlayerHit | null {
  const p = item?.player ?? item;
  const id = Number(p?.id);
  const name = String(p?.name || "");
  if (!id || !name) return null;

  const nationality = p?.nationality || p?.country || undefined;
  const photo = p?.photo || p?.image || undefined;

  const stats0 = asArr(item?.statistics)[0];
  const teamName = stats0?.team?.name;
  const teamLogo = stats0?.team?.logo;

  return { sport, id, name, nationality, photo, teamName, teamLogo };
}

function normMatch(sport: SportId, item: any): MatchHit | null {
  // Football fixtures shape
  if (sport === "football") {
    const fixture = item?.fixture;
    const id = Number(fixture?.id);
    if (!id) return null;

    const date = fixture?.date;
    const status = fixture?.status?.short || fixture?.status?.long;

    const leagueName = item?.league?.name;
    const leagueLogo = item?.league?.logo;

    const homeName = item?.teams?.home?.name;
    const homeLogo = item?.teams?.home?.logo;
    const awayName = item?.teams?.away?.name;
    const awayLogo = item?.teams?.away?.logo;

    return { sport, id, date, status, leagueName, leagueLogo, homeName, homeLogo, awayName, awayLogo };
  }

  // Other sports "games" shape
  const id = Number(item?.id);
  if (!id) return null;

  const date = item?.date;
  const status = item?.status?.short || item?.status?.long;

  const leagueName = item?.league?.name;
  const leagueLogo = item?.league?.logo;

  const homeName = item?.teams?.home?.name;
  const homeLogo = item?.teams?.home?.logo;
  const awayName = item?.teams?.away?.name;
  const awayLogo = item?.teams?.away?.logo;

  return { sport, id, date, status, leagueName, leagueLogo, homeName, homeLogo, awayName, awayLogo };
}

function parseVsQuery(q: string): { a: string; b: string } | null {
  const raw = q.toLowerCase().replace(/\s+/g, " ").trim();
  const m =
    raw.split(" vs ").length === 2
      ? raw.split(" vs ")
      : raw.split(" v ").length === 2
        ? raw.split(" v ")
        : raw.split(" vs. ").length === 2
          ? raw.split(" vs. ")
          : null;

  if (!m) return null;
  const a = m[0].trim();
  const b = m[1].trim();
  if (a.length < 2 || b.length < 2) return null;
  return { a, b };
}

export default function MobileSearch({
  open,
  onClose,
  initialSport,
}: {
  open: boolean;
  onClose: () => void;
  initialSport: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY || "";

  const [sport, setSport] = useState<SportId>(() => safeSport(initialSport));
  const [allSports, setAllSports] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [data, setData] = useState<ResultBundle>({ leagues: [], teams: [], players: [], matches: [] });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sportsList = useMemo(() => Object.keys(SPORT_DEFS) as SportId[], []);

  useEffect(() => {
    if (!open) return;
    setSport(safeSport(initialSport));
    setAllSports(false);
    setQ("");
    setErr(null);
    setData({ leagues: [], teams: [], players: [], matches: [] });

    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open, initialSport]);

  useEffect(() => {
    if (!open) return;

    if (!apiKey) {
      setErr("Missing API key (NEXT_PUBLIC_API_SPORTS_KEY).");
      return;
    }

    const query = q.trim();
    if (query.length < 2) {
      setErr(null);
      setData({ leagues: [], teams: [], players: [], matches: [] });
      return;
    }

    setLoading(true);
    setErr(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      const sportsToSearch: SportId[] = allSports ? sportsList : [sport];
      const season = String(new Date().getFullYear());
      const vs = parseVsQuery(query);

      const next: ResultBundle = { leagues: [], teams: [], players: [], matches: [] };

      try {
        await Promise.all(
          sportsToSearch.map(async (sId) => {
            const def = SPORT_DEFS[sId];
            const host = def.host;

            const doFetch = async (path: string) => {
              const url = `https://${host}/${path}`;
              const res = await fetch(url, {
                method: "GET",
                headers: buildHeaders(host, apiKey),
                signal: controller.signal,
              });
              if (!res.ok) throw new Error(`Search failed (${res.status})`);
              return res.json();
            };

            const [leaguesJson, teamsJson] = await Promise.all([
              doFetch(`leagues?search=${encodeURIComponent(query)}`),
              doFetch(`teams?search=${encodeURIComponent(query)}`),
            ]);

            next.leagues.push(
              ...asArr(leaguesJson?.response).map((x) => normLeague(sId, x)).filter(Boolean) as LeagueHit[]
            );
            next.teams.push(
              ...asArr(teamsJson?.response).map((x) => normTeam(sId, x)).filter(Boolean) as TeamHit[]
            );

            if (query.length >= 3) {
              let playersJson: any = null;

              const tryPaths =
                sId === "football"
                  ? [
                      `players?search=${encodeURIComponent(query)}&season=${encodeURIComponent(season)}`,
                      `players?search=${encodeURIComponent(query)}`,
                      `players/profiles?search=${encodeURIComponent(query)}`,
                    ]
                  : [
                      `players?search=${encodeURIComponent(query)}`,
                      `players?search=${encodeURIComponent(query)}&season=${encodeURIComponent(season)}`,
                    ];

              for (const p of tryPaths) {
                try {
                  playersJson = await doFetch(p);
                  if (asArr(playersJson?.response).length) break;
                } catch {
                  // ignore and try next
                }
              }

              if (playersJson) {
                next.players.push(
                  ...asArr(playersJson?.response).map((x) => normPlayer(sId, x)).filter(Boolean) as PlayerHit[]
                );
              }
            }

            if (vs && sId === "football") {
              const teamSearchA = await doFetch(`teams?search=${encodeURIComponent(vs.a)}`);
              const teamSearchB = await doFetch(`teams?search=${encodeURIComponent(vs.b)}`);

              const a0 = (asArr(teamSearchA?.response).map((x) => normTeam(sId, x)).filter(Boolean) as TeamHit[])[0];
              const b0 = (asArr(teamSearchB?.response).map((x) => normTeam(sId, x)).filter(Boolean) as TeamHit[])[0];

              if (a0?.id && b0?.id) {
                let h2hJson: any = null;
                try {
                  h2hJson = await doFetch(
                    `fixtures/headtohead?h2h=${encodeURIComponent(`${a0.id}-${b0.id}`)}&last=15`
                  );
                } catch {
                  // ignore
                }

                if (h2hJson) {
                  next.matches.push(
                    ...asArr(h2hJson?.response).map((x) => normMatch(sId, x)).filter(Boolean) as MatchHit[]
                  );
                }
              }
            }
          })
        );

        const uniq = <T extends { sport: SportId; id: number }>(arr: T[]) => {
          const seen = new Set<string>();
          const out: T[] = [];
          for (const x of arr) {
            const k = `${x.sport}:${x.id}`;
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(x);
          }
          return out;
        };

        setData({
          leagues: uniq(next.leagues).slice(0, 25),
          teams: uniq(next.teams).slice(0, 25),
          players: uniq(next.players).slice(0, 25),
          matches: uniq(next.matches).slice(0, 25),
        });
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Search failed.");
        setData({ leagues: [], teams: [], players: [], matches: [] });
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, apiKey, q, sport, allSports, sportsList]);

  if (!open) return null;

  const hasAny = data.leagues.length || data.teams.length || data.players.length || data.matches.length;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button type="button" onClick={onClose} className="absolute inset-0 bg-black/40" aria-label="Close search" />

      {/* sheet */}
      <div className="absolute bottom-0 left-0 right-0 theme-bg theme-border border-t rounded-t-2xl shadow-xl">
        <div className="mx-auto max-w-2xl px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-base font-semibold text-primary">Search</div>
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:theme-soft" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          {/* sport row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {sportsList.map((sId) => {
              const active = !allSports && sId === sport;
              return (
                <button
                  key={sId}
                  type="button"
                  onClick={() => {
                    setAllSports(false);
                    setSport(sId);
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold border theme-border rounded-lg transition-colors",
                    active ? "bg-blue-600 text-white border-blue-600" : "theme-soft text-secondary"
                  )}
                >
                  {SPORT_DEFS[sId].label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setAllSports((v) => !v)}
              className={cn(
                "ml-auto px-3 py-1.5 text-xs font-semibold border theme-border rounded-lg transition-colors",
                allSports ? "bg-blue-600 text-white border-blue-600" : "theme-soft text-secondary"
              )}
              title="Search across all sports"
            >
              All Sports
            </button>
          </div>

          {/* input */}
          <div className="mt-3">
            <div className="flex items-center gap-2 theme-border border rounded-xl px-3 py-2">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Search leagues, teams, players… or "Team A vs Team B"'
                className="w-full bg-transparent outline-none text-sm text-primary"
              />
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            </div>
            <div className="mt-2 text-[11px] text-secondary">All results open in a new tab.</div>
          </div>

          {/* results */}
          <div className="mt-4 space-y-4">
            {err ? <div className="text-sm text-red-500">{err}</div> : null}
            {!err && q.trim().length >= 2 && !loading && !hasAny ? (
              <div className="text-sm text-secondary">No results.</div>
            ) : null}

            {/* Matches */}
            {data.matches.length ? (
              <Section title="Matches">
                <div className="divide-y theme-border border rounded-xl overflow-hidden">
                  {data.matches.map((m) => {
                    const href = `/match/${m.sport}/${encodeURIComponent(String(m.id))}/summary`;
                    return (
                      <a
                        key={`${m.sport}-match-${m.id}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 hover:theme-soft transition-colors"
                      >
                        <TeamsMini homeLogo={m.homeLogo} awayLogo={m.awayLogo} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-primary truncate">
                            {m.homeName || "Home"} vs {m.awayName || "Away"}
                          </div>
                          <div className="text-[11px] text-secondary truncate">
                            {(m.leagueName ? m.leagueName : "Match")}
                            {m.status ? ` • ${m.status}` : ""}
                            {m.date ? ` • ${new Date(m.date).toLocaleString()}` : ""}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            {/* Players */}
            {data.players.length ? (
              <Section title="Players">
                <div className="divide-y theme-border border rounded-xl overflow-hidden">
                  {data.players.map((p) => {
                    // ✅ ONLY CHANGE: players now use path routing
                    const href = `/player/${encodeURIComponent(p.sport)}/${encodeURIComponent(String(p.id))}`;
                    return (
                      <a
                        key={`${p.sport}-player-${p.id}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 hover:theme-soft transition-colors"
                      >
                        {p.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photo} alt="" className="w-8 h-8 rounded-full object-cover bg-white/70" />
                        ) : (
                          <div className="w-8 h-8 rounded-full theme-soft" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-primary truncate">{p.name}</div>
                          <div className="text-[11px] text-secondary truncate">
                            {[p.teamName, p.nationality, SPORT_DEFS[p.sport].label].filter(Boolean).join(" • ")}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            {/* Teams */}
            {data.teams.length ? (
              <Section title="Teams">
                <div className="divide-y theme-border border rounded-xl overflow-hidden">
                  {data.teams.map((t) => {
                    const href = `/team?id=${encodeURIComponent(String(t.id))}&sport=${encodeURIComponent(t.sport)}`;
                    return (
                      <a
                        key={`${t.sport}-team-${t.id}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 hover:theme-soft transition-colors"
                      >
                        {t.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.logo} alt="" className="w-7 h-7 rounded-md object-contain bg-white/70" />
                        ) : (
                          <div className="w-7 h-7 rounded-md theme-soft" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-primary truncate">{t.name}</div>
                          <div className="text-[11px] text-secondary truncate">
                            {[t.country, SPORT_DEFS[t.sport].label].filter(Boolean).join(" • ")}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </Section>
            ) : null}

            {/* Leagues */}
            {data.leagues.length ? (
              <Section title="Leagues">
                <div className="divide-y theme-border border rounded-xl overflow-hidden">
                  {data.leagues.map((l) => {
                    const href = `/sports/${l.sport}/all/league/${encodeURIComponent(String(l.id))}/`;
                    return (
                      <a
                        key={`${l.sport}-league-${l.id}`}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="flex items-center gap-3 px-3 py-2 hover:theme-soft transition-colors"
                      >
                        {l.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={l.logo} alt="" className="w-7 h-7 rounded-md object-contain bg-white/70" />
                        ) : (
                          <div className="w-7 h-7 rounded-md theme-soft" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-primary truncate">{l.name}</div>
                          <div className="text-[11px] text-secondary truncate">
                            {[l.country, SPORT_DEFS[l.sport].label].filter(Boolean).join(" • ")}
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </Section>
            ) : null}
          </div>

          {!apiKey ? (
            <div className="mt-3 text-[11px] text-secondary">
              Note: set <span className="font-mono">NEXT_PUBLIC_API_SPORTS_KEY</span> in your env to enable search.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-secondary">{title}</div>
      {children}
    </div>
  );
}

function TeamsMini({ homeLogo, awayLogo }: { homeLogo?: string; awayLogo?: string }) {
  return (
    <div className="flex items-center -space-x-2">
      {homeLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={homeLogo} alt="" className="w-7 h-7 rounded-full object-contain bg-white/80 border theme-border" />
      ) : (
        <div className="w-7 h-7 rounded-full theme-soft border theme-border" />
      )}
      {awayLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={awayLogo} alt="" className="w-7 h-7 rounded-full object-contain bg-white/80 border theme-border" />
      ) : (
        <div className="w-7 h-7 rounded-full theme-soft border theme-border" />
      )}
    </div>
  );
}
