"use client";

import { useEffect, useState } from "react";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";

const MOCK_NBA_GAMES = [
  {
    id: 1, date: new Date().toISOString(), status: { short: "FT", long: "Finished" },
    league: { id: 12, name: "NBA", country: "USA", logo: "https://media.api-sports.io/basketball/leagues/12.png" },
    teams: { home: { id: 145, name: "Lakers", logo: "https://media.api-sports.io/basketball/teams/145.png" }, away: { id: 146, name: "Warriors", logo: "https://media.api-sports.io/basketball/teams/146.png" } },
    scores: { home: { total: 110 }, away: { total: 105 } }
  },
  {
    id: 2, date: new Date(Date.now() + 86400000).toISOString(), status: { short: "NS", long: "Scheduled" },
    league: { id: 12, name: "NBA", country: "USA", logo: "https://media.api-sports.io/basketball/leagues/12.png" },
    teams: { home: { id: 135, name: "Celtics", logo: "https://media.api-sports.io/basketball/teams/135.png" }, away: { id: 136, name: "Heat", logo: "https://media.api-sports.io/basketball/teams/136.png" } },
    scores: { home: { total: null }, away: { total: null } }
  }
];

export default function BasketballFeed({ leagueId }: { leagueId?: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const targetLeague = leagueId || "12"; 
        const season = "2024-2025"; 
        
        if (!apiKey) throw new Error("No API Key");

        const params = new URLSearchParams();
        params.set("league", targetLeague);
        params.set("season", season);
        params.set("timezone", "UTC");

        const url = `https://v1.basketball.api-sports.io/games?${params.toString()}`;
        
        const res = await fetch(url, {
          headers: { "x-rapidapi-host": "v1.basketball.api-sports.io", "x-rapidapi-key": apiKey }
        });

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];

        // FALLBACK: If empty, use Mock Data immediately
        if (rawList.length === 0) {
          console.warn("Basketball API empty, using mock.");
          setGames(MOCK_NBA_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
          return;
        }

        // SMART FILTER
        const now = new Date();
        const past = new Date(now); past.setDate(now.getDate() - 7);
        const future = new Date(now); future.setDate(now.getDate() + 7);

        const filtered = rawList.filter((item: any) => {
          const d = new Date(item.date || item.timestamp * 1000);
          return d >= past && d <= future;
        });

        const finalData = filtered.length > 0 ? filtered : rawList.slice(-15);
        
        // FIX: Added (g: any) type annotation
        setGames(finalData.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);

      } catch (err) {
        console.error("Basketball Feed Error:", err);
        setGames(MOCK_NBA_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [leagueId]);

  return <FeedUI games={games} loading={loading} sport="basketball" leagueId={leagueId} />;
}