"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

function PlayerProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      if (!id) return;
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v3.football.api-sports.io";
        
        // Fetch player info for a recent season (2023 to ensure data exists)
        const res = await fetch(`https://${host}/players?id=${id}&season=2023`, {
          headers: { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" }
        });
        const json = await res.json();
        setPlayerData(json.response?.[0]);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
    fetchPlayer();
  }, [id]);

  if (!id) return <div className="p-10 text-center">No Player ID provided.</div>;
  if (loading) return <div className="p-10"><Skeleton className="h-64 w-full max-w-2xl mx-auto rounded-xl" /></div>;
  if (!playerData) return <div className="p-10 text-center">Player not found.</div>;

  const { player, statistics } = playerData;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* Player Header */}
      <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <img src={player.photo} alt={player.name} className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover" />
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-black text-primary">{player.name}</h1>
          <p className="text-secondary font-medium">{player.firstname} {player.lastname}</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statistics.map((stat: any, idx: number) => (
          <div key={idx} className="theme-bg border theme-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 border-b theme-border pb-3">
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
                 <div className="font-bold text-lg text-primary">{stat.games.rating ? parseFloat(stat.games.rating).toFixed(1) : "-"}</div>
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
    <Suspense fallback={<div className="p-10 text-center">Loading Player...</div>}>
       <PlayerProfileContent />
    </Suspense>
  );
}