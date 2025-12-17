"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";

function pickParam(val: string | string[] | undefined): string | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] : val;
}

function sportToHost(sport: string) {
  const s = (sport || "football").toLowerCase();
  const hosts: Record<string, string> = {
    football: "v3.football.api-sports.io",
    basketball: "v1.basketball.api-sports.io",
    nfl: "v1.american-football.api-sports.io",
    baseball: "v1.baseball.api-sports.io",
    hockey: "v1.hockey.api-sports.io",
    rugby: "v1.rugby.api-sports.io",
    volleyball: "v1.volleyball.api-sports.io",
  };
  return hosts[s] || hosts.football;
}

function PlayerProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="w-full md:flex-1 space-y-3">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Skeleton className="h-8 w-64 rounded-lg" />
            <Skeleton className="h-4 w-44 rounded-lg" />
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-16 rounded-md" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="theme-bg border theme-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 border-b theme-border pb-3">
              <Skeleton className="w-8 h-8 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 text-center">
              {Array.from({ length: 6 }).map((__, j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-14 mx-auto rounded-md" />
                  <Skeleton className="h-6 w-10 mx-auto rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const pathSport = pickParam((params as any)?.sport);
  const pathId = pickParam((params as any)?.id);

  const id = pathId || searchParams.get("id");
  const sport = (pathSport || searchParams.get("sport") || "football").toLowerCase();

  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      if (!id) return;
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        if (!apiKey) throw new Error("Missing NEXT_PUBLIC_API_SPORTS_KEY");

        const host = sportToHost(sport);

        // Try current year, then previous, then 2023
        const y = new Date().getFullYear();
        const seasons = [y, y - 1, 2023];

        let found: any = null;

        for (const season of seasons) {
          const res = await fetch(`https://${host}/players?id=${encodeURIComponent(id)}&season=${season}`, {
            headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey },
          });
          const json = await res.json();
          if (json?.response?.[0]) {
            found = json.response[0];
            break;
          }
        }

        setPlayerData(found);
      } catch (e) {
        console.error(e);
        setPlayerData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [id, sport]);

  if (!id) return <div className="p-10 text-center">No Player ID provided.</div>;
  if (loading) return <PlayerProfileSkeleton />;
  if (!playerData) return <div className="p-10 text-center">Player not found.</div>;

  const { player, statistics } = playerData;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={player.photo}
          alt={player.name}
          className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover"
        />
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-black text-primary">{player.name}</h1>
          <p className="text-secondary font-medium">
            {player.firstname} {player.lastname}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-bold uppercase tracking-wider text-secondary mt-2">
            <span>Age: {player.age}</span>
            <span>•</span>
            <span>{player.nationality}</span>
            <span>•</span>
            <span>{player.height || "-"}</span>
            <span>•</span>
            <span>{player.weight || "-"}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statistics.map((stat: any, idx: number) => (
          <div key={idx} className="theme-bg border theme-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 border-b theme-border pb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stat.team.logo} className="w-8 h-8 object-contain" alt={stat.team.name} />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-primary">{stat.team.name}</span>
                <span className="text-xs text-secondary">{stat.league.name}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-y-4 text-center">
              <div>
                <div className="text-xs text-secondary uppercase">Apps</div>
                <div className="font-bold text-lg text-primary">{stat.games.appearences ?? 0}</div>
              </div>
              <div>
                <div className="text-xs text-secondary uppercase">Goals</div>
                <div className="font-bold text-lg text-green-500">{stat.goals.total ?? 0}</div>
              </div>
              <div>
                <div className="text-xs text-secondary uppercase">Assists</div>
                <div className="font-bold text-lg text-blue-500">{stat.goals.assists ?? 0}</div>
              </div>
              <div>
                <div className="text-xs text-secondary uppercase">Minutes</div>
                <div className="font-bold text-lg text-primary">{stat.games.minutes ?? 0}'</div>
              </div>
              <div>
                <div className="text-xs text-secondary uppercase">Rating</div>
                <div className="font-bold text-lg text-primary">
                  {stat.games.rating ? parseFloat(stat.games.rating).toFixed(1) : "-"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={<PlayerProfileSkeleton />}>
      <PlayerProfileContent />
    </Suspense>
  );
}
