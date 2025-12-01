"use client";

import { useEffect, useState } from "react";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";

const MOCK_NFL_GAMES = [
  {
    game: { id: 101, date: new Date().toISOString(), status: { short: "FT", long: "Finished" } },
    league: { id: 1, name: "NFL", country: "USA", logo: "https://media.api-sports.io/american-football/leagues/1.png" },
    teams: { home: { id: 1, name: "Chiefs", logo: "https://media.api-sports.io/american-football/teams/1.png" }, away: { id: 2, name: "Ravens", logo: "https://media.api-sports.io/american-football/teams/2.png" } },
    scores: { home: { total: 27 }, away: { total: 20 } }
  },
  {
    game: { id: 102, date: new Date(Date.now() + 86400000).toISOString(), status: { short: "NS", long: "Scheduled" } },
    league: { id: 1, name: "NFL", country: "USA", logo: "https://media.api-sports.io/american-football/leagues/1.png" },
    teams: { home: { id: 3, name: "Eagles", logo: "https://media.api-sports.io/american-football/teams/3.png" }, away: { id: 4, name: "Packers", logo: "https://media.api-sports.io/american-football/teams/4.png" } },
    scores: { home: { total: null }, away: { total: null } }
  }
];

export default function NFLFeed({ leagueId }: { leagueId?: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const targetLeague = leagueId || "1"; 
        const season = "2024";

        if (!apiKey) throw new Error("No API Key");

        const params = new URLSearchParams();
        params.set("league", targetLeague);
        params.set("season", season);
        params.set("timezone", "UTC");

        const url = `https://v1.american-football.api-sports.io/games?${params.toString()}`;
        
        const res = await fetch(url, {
          headers: { "x-rapidapi-host": "v1.american-football.api-sports.io", "x-rapidapi-key": apiKey }
        });

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];

        if (rawList.length === 0) {
          console.warn("NFL API empty, using mock.");
          setGames(MOCK_NFL_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
          return;
        }

        const now = new Date();
        const past = new Date(now); past.setDate(now.getDate() - 7);
        const future = new Date(now); future.setDate(now.getDate() + 7);

        const filtered = rawList.filter((item: any) => {
          const d = new Date(item.game?.date || item.date);
          return d >= past && d <= future;
        });

        const finalData = filtered.length > 0 ? filtered : rawList.slice(-15);
        
        // FIX: Added (g: any) type annotation
        setGames(finalData.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);

      } catch (err) {
        console.error("NFL Feed Error:", err);
        setGames(MOCK_NFL_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [leagueId]);

  return <FeedUI games={games} loading={loading} sport="nfl" leagueId={leagueId} />;
}