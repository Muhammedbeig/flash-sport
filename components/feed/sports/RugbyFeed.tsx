"use client";

import { useEffect, useState } from "react";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";

const MOCK_RUGBY_GAMES = [
  {
    game: { id: 501, date: new Date().toISOString(), status: { short: "FT", long: "Finished" } },
    league: { id: 13, name: "Premiership Rugby", country: "England", logo: "https://media.api-sports.io/rugby/leagues/13.png" },
    teams: { home: { id: 1, name: "Saracens", logo: "https://media.api-sports.io/rugby/teams/1.png" }, away: { id: 2, name: "Exeter Chiefs", logo: "https://media.api-sports.io/rugby/teams/2.png" } },
    scores: { home: 24, away: 18 }
  },
  {
    game: { id: 502, date: new Date(Date.now() + 86400000).toISOString(), status: { short: "NS", long: "Scheduled" } },
    league: { id: 13, name: "Premiership Rugby", country: "England", logo: "https://media.api-sports.io/rugby/leagues/13.png" },
    teams: { home: { id: 3, name: "Bath Rugby", logo: "https://media.api-sports.io/rugby/teams/3.png" }, away: { id: 4, name: "Leicester Tigers", logo: "https://media.api-sports.io/rugby/teams/4.png" } },
    scores: { home: null, away: null }
  }
];

export default function RugbyFeed({ leagueId }: { leagueId?: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        // 1. CONFIGURATION
        // Default to Premiership Rugby (ID 13) if no league selected
        const targetLeague = leagueId || "13"; 
        const season = "2024"; 
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        if (!apiKey) throw new Error("No API Key");

        const params = new URLSearchParams();
        params.set("league", targetLeague);
        params.set("season", season);
        params.set("timezone", timezone);

        // 2. FETCH SEASON
        const url = `https://v1.rugby.api-sports.io/games?${params.toString()}`;
        
        const res = await fetch(url, {
          headers: { "x-rapidapi-host": "v1.rugby.api-sports.io", "x-rapidapi-key": apiKey }
        });

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];

        // FALLBACK: If empty, use Mock Data immediately
        if (rawList.length === 0) {
          console.warn("Rugby API empty, using mock.");
          setGames(MOCK_RUGBY_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
          return;
        }

        // 3. SMART FILTER: 1 Week Past + 1 Week Future
        const now = new Date();
        const past = new Date(now); past.setDate(now.getDate() - 7);
        const future = new Date(now); future.setDate(now.getDate() + 7);

        const filtered = rawList.filter((item: any) => {
          const d = new Date(item.game?.date || item.date);
          return d >= past && d <= future;
        });

        const finalData = filtered.length > 0 ? filtered : rawList.slice(-15);
        
        // FIX: Explicit Type Assertion to prevent TS errors
        setGames(finalData.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);

      } catch (err) {
        console.error("Rugby Feed Error (Using Mock):", err);
        setGames(MOCK_RUGBY_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [leagueId]);

  return <FeedUI games={games} loading={loading} sport="rugby" leagueId={leagueId} />;
}