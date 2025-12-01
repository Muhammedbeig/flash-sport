"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Trophy, Calendar, MapPin, Ruler, Weight } from "lucide-react";

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

export default function PlayerProfile() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const sport = searchParams.get("sport") || "football";
  const { theme } = useTheme();

  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayer() {
      if (!id) return;
      setLoading(true);

      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        // Default to current season (logic can be improved to find active season)
        const season = new Date().getFullYear(); 
        
        let url = "";
        let headers: Record<string, string> = {};

        // Hosts mapping
        const hosts: Record<string, string> = {
           football: "v3.football.api-sports.io",
           nba: "v1.basketball.api-sports.io",
        };
        const host = hosts[sport] || hosts.football;

        if (sport === "football" && cdnUrl) {
           // Note: CDN might not cache specific player/season combos effectively if not pre-warmed.
           // Fallback to API key for specific player data is often safer.
           url = `https://${host}/players?id=${id}&season=${season}`; 
           headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        } else {
           if (!apiKey) throw new Error("No API Key");
           url = `https://${host}/players?id=${id}&season=${season}`;
           headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();

        if (json.response && json.response[0]) {
          setData(json.response[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlayer();
  }, [id, sport]);

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-40 w-full rounded-xl" /><Skeleton className="h-64 w-full rounded-xl" /></div>;
  if (!data) return <div className="p-10 text-center text-secondary">Player profile not found.</div>;

  const p = data.player;
  const stats = data.statistics[0]; // Primary league stats usually come first

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* 1. HEADER PROFILE CARD */}
      <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <img src={p.photo} alt={p.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 object-cover" />
          {stats?.team?.logo && (
            <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm border theme-border">
               <img src={stats.team.logo} className="w-8 h-8 object-contain" />
            </div>
          )}
        </div>
        
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-primary tracking-tight">{p.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-secondary font-medium uppercase tracking-wide">
             <span className="flex items-center gap-1"><MapPin size={14}/> {p.nationality}</span>
             <span className="flex items-center gap-1"><Calendar size={14}/> {p.age} Years</span>
             <span className="flex items-center gap-1"><Ruler size={14}/> {p.height}</span>
             <span className="flex items-center gap-1"><Weight size={14}/> {p.weight}</span>
          </div>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Games & Ratings */}
        <div className="theme-bg border theme-border rounded-xl p-5">
           <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">Season Performance</h3>
           <div className="grid grid-cols-2 gap-4">
              <StatBox label="Rating" value={stats.games.rating ? parseFloat(stats.games.rating).toFixed(1) : "-"} highlight />
              <StatBox label="Appearances" value={stats.games.appearences} />
              <StatBox label="Minutes" value={stats.games.minutes} />
              <StatBox label="Position" value={stats.games.position} />
           </div>
        </div>

        {/* Attack */}
        <div className="theme-bg border theme-border rounded-xl p-5">
           <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">Attack</h3>
           <div className="grid grid-cols-2 gap-4">
              <StatBox label="Goals" value={stats.goals.total} highlight color="text-green-500" />
              <StatBox label="Assists" value={stats.goals.assists} />
              <StatBox label="Shots (Total)" value={stats.games.appearences ? "N/A" : "-"} /> {/* API doesn't always send raw shots in basic summary */}
              <StatBox label="Dribbles Success" value={stats.dribbles.success} />
           </div>
        </div>

        {/* Passing */}
        <div className="theme-bg border theme-border rounded-xl p-5">
           <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">Passing</h3>
           <div className="grid grid-cols-2 gap-4">
              <StatBox label="Key Passes" value={stats.passes.key} />
              <StatBox label="Accuracy" value={stats.passes.accuracy ? `${stats.passes.accuracy}%` : "-"} />
           </div>
        </div>

        {/* Defense */}
        <div className="theme-bg border theme-border rounded-xl p-5">
           <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 border-b theme-border pb-2">Defense & Discipline</h3>
           <div className="grid grid-cols-2 gap-4">
              <StatBox label="Tackles" value={stats.tackles.total} />
              <StatBox label="Interceptions" value={stats.tackles.interceptions} />
              <StatBox label="Yellow Cards" value={stats.cards.yellow} color="text-yellow-500" />
              <StatBox label="Red Cards" value={stats.cards.red} color="text-red-500" />
           </div>
        </div>

      </div>
    </div>
  );
}

function StatBox({ label, value, highlight, color }: { label: string, value: any, highlight?: boolean, color?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase text-muted-foreground">{label}</span>
      <span className={`text-lg font-bold ${color ? color : highlight ? "text-primary" : "text-secondary"}`}>
        {value ?? 0}
      </span>
    </div>
  );
}