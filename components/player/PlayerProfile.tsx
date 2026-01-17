"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Calendar, MapPin, Ruler, Weight } from "lucide-react";

// --- TYPES ---
type PlayerData = {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: { date: string; place: string; country: string };
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: {
    team: { id: number; name: string; logo: string };
    league: { id: number; name: string; logo: string; season: number };
    games: { appearences: number; minutes: number; position: string; rating: string };
    goals: { total: number; assists: number };
    passes: { total: number; key: number; accuracy: number };
    tackles: { total: number; blocks: number; interceptions: number };
    duels: { total: number; won: number };
    dribbles: { attempts: number; success: number };
    fouls: { drawn: number; committed: number };
    cards: { yellow: number; yellowred: number; red: number };
    penalty: { won: number; commited: number; scored: number; missed: number; saved: number };
  }[];
};

type PlayerProfileProps = {
  // ✅ allow path-based props
  sport?: string;
  id?: string | number;
};

function normalizeSport(raw?: string) {
  const s = (raw || "football").toLowerCase();
  if (s === "soccer") return "football";
  if (s === "ice-hockey") return "hockey";
  if (s === "american-football") return "nfl";
  if (s === "nba") return "basketball";
  return s;
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function getSeasonCandidates(rawSport: string): string[] {
  const sport = normalizeSport(rawSport);
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0=Jan
  const crossYearStart = m >= 7 ? y : y - 1; // Aug+

  if (sport === "basketball") {
    const start = crossYearStart;
    return uniq([`${start}-${start + 1}`, `${start - 1}-${start}`, `${start + 1}-${start + 2}`]).slice(0, 3);
  }

  if (sport === "baseball") {
    return uniq([String(y), String(y - 1), String(y + 1)]).slice(0, 3);
  }

  return uniq([
    String(crossYearStart),
    String(y),
    String(crossYearStart + 1),
    String(y - 1),
    String(crossYearStart - 1),
    String(y + 1),
  ]).slice(0, 3);
}

/** ✅ Only UI skeleton (no logic changes) */
function PlayerProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* HEADER CARD SKELETON */}
      <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full" />
          <div className="absolute -bottom-2 -right-2 theme-bg border theme-border rounded-full p-1 shadow-sm">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>

        <div className="w-full text-center md:text-left space-y-3">
          <Skeleton className="h-8 w-60 mx-auto md:mx-0 rounded-lg" />

          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs uppercase tracking-wide">
            <span className="flex items-center gap-2 theme-bg border theme-border rounded-full px-3 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </span>
            <span className="flex items-center gap-2 theme-bg border theme-border rounded-full px-3 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </span>
            <span className="flex items-center gap-2 theme-bg border theme-border rounded-full px-3 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-14 rounded" />
            </span>
            <span className="flex items-center gap-2 theme-bg border theme-border rounded-full px-3 py-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-3 w-14 rounded" />
            </span>
          </div>
        </div>
      </div>

      {/* STATS GRID SKELETON (matches your cards layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="theme-bg border theme-border rounded-xl p-5">
            <div className="mb-4 border-b theme-border pb-2">
              <Skeleton className="h-4 w-44 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="p-4 rounded-lg theme-bg border theme-border">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-8 w-16 mt-2 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlayerProfile(props: PlayerProfileProps) {
  const searchParams = useSearchParams();
  const { theme } = useTheme();

  // Support BOTH:
  // 1) New path routing: /player/{sport}/{id}
  // 2) Old query routing: /player?id=...&sport=...
  const resolved = useMemo(() => {
    const qId = searchParams.get("id");
    const qSport = searchParams.get("sport");

    const finalId = (props.id ?? qId ?? "").toString();
    const finalSport = (props.sport ?? qSport ?? "football").toString();

    return { id: finalId, sport: finalSport };
  }, [props.id, props.sport, searchParams]);

  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      if (!resolved.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        if (!apiKey) throw new Error("Missing NEXT_PUBLIC_API_SPORTS_KEY");

        // Hosts mapping (expanded safely; doesn’t affect UI)
        const hosts: Record<string, string> = {
          football: "v3.football.api-sports.io",
          basketball: "v1.basketball.api-sports.io",
          nba: "v1.basketball.api-sports.io",
          nfl: "v1.american-football.api-sports.io",
          baseball: "v1.baseball.api-sports.io",
          hockey: "v1.hockey.api-sports.io",
          rugby: "v1.rugby.api-sports.io",
          volleyball: "v1.volleyball.api-sports.io",
        };

        const sport = normalizeSport(resolved.sport || "football");
        const host = hosts[sport] || hosts.football;

        const seasons = getSeasonCandidates(sport);

        let found: any = null;

        for (const season of seasons) {
          const url = `https://${host}/players?id=${encodeURIComponent(resolved.id)}&season=${encodeURIComponent(
            season
          )}`;

          const headers: Record<string, string> = {
            "x-rapidapi-host": host,
            "x-rapidapi-key": apiKey,
          };

          const res = await fetch(url, { headers });
          const json = await res.json();

          if (json?.response?.[0]) {
            found = json.response[0];
            break;
          }
        }

        setData(found);
      } catch (err) {
        console.error(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayer();
  }, [resolved.id, resolved.sport]);

  if (loading) {
    return <PlayerProfileSkeleton />;
  }

  if (!resolved.id) {
    return <div className="p-10 text-center text-secondary">Invalid player ID.</div>;
  }

  if (!data) {
    return <div className="p-10 text-center text-secondary">Player profile not found.</div>;
  }

  const p = data.player;
  const stats = data.statistics?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. HEADER PROFILE CARD */}
      <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.photo}
            alt={p.name}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover"
          />
          {stats?.team?.logo && (
            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm border theme-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stats.team.logo} className="w-8 h-8 object-contain" alt="" />
            </div>
          )}
        </div>

        <div className="text-center md:text-left space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">{p.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-secondary font-medium uppercase tracking-wide">
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {p.nationality}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} /> {p.age} Years
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={14} /> {p.height}
            </span>
            <span className="flex items-center gap-1">
              <Weight size={14} /> {p.weight}
            </span>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="theme-bg border theme-border rounded-xl p-5">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">
            Season Performance
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatBox
              label="Rating"
              value={stats?.games?.rating ? parseFloat(stats.games.rating).toFixed(1) : "-"}
              highlight
            />
            <StatBox label="Appearances" value={stats?.games?.appearences} />
            <StatBox label="Minutes" value={stats?.games?.minutes} />
            <StatBox label="Position" value={stats?.games?.position} />
          </div>
        </div>

        <div className="theme-bg border theme-border rounded-xl p-5">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">
            Attack
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Goals" value={stats?.goals?.total} highlight color="text-green-500" />
            <StatBox label="Assists" value={stats?.goals?.assists} />
            <StatBox label="Dribbles Success" value={stats?.dribbles?.success} />
            <StatBox label="Key Passes" value={stats?.passes?.key} />
          </div>
        </div>

        <div className="theme-bg border theme-border rounded-xl p-5">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">
            Passing
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Total Passes" value={stats?.passes?.total} />
            <StatBox label="Accuracy" value={stats?.passes?.accuracy ? `${stats.passes.accuracy}%` : "-"} />
          </div>
        </div>

        <div className="theme-bg border theme-border rounded-xl p-5">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">
            Defense & Discipline
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <StatBox label="Tackles" value={stats?.tackles?.total} />
            <StatBox label="Interceptions" value={stats?.tackles?.interceptions} />
            <StatBox label="Yellow Cards" value={stats?.cards?.yellow} color="text-yellow-500" />
            <StatBox label="Red Cards" value={stats?.cards?.red} color="text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: any;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <div className="p-4 rounded-lg theme-bg border theme-border">
      <div className="text-xs font-bold text-secondary uppercase tracking-wider">{label}</div>
      <div className={`mt-1 text-2xl font-black ${color || "text-primary"} ${highlight ? "" : ""}`}>
        {value ?? "-"}
      </div>
    </div>
  );
}
