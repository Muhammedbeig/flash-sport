"use client";

import { useEffect, useState } from "react";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";

const MOCK_HOCKEY_GAMES = [
  {
    game: { id: 10, date: new Date().toISOString(), status: { short: "FT", long: "Finished" } },
    league: { id: 57, name: "NHL", country: "USA", logo: "https://media.api-sports.io/hockey/leagues/57.png" },
    teams: { home: { id: 1, name: "Bruins", logo: "https://media.api-sports.io/hockey/teams/1.png" }, away: { id: 2, name: "Rangers", logo: "https://media.api-sports.io/hockey/teams/2.png" } },
    scores: { home: 3, away: 2 }
  }
];

export default function HockeyFeed({ leagueId }: { leagueId?: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const targetLeague = leagueId || "57"; // NHL
        const season = "2024";

        if (!apiKey) throw new Error("No API Key");

        const params = new URLSearchParams();
        params.set("league", targetLeague);
        params.set("season", season);
        params.set("timezone", "UTC");

        const url = `https://v1.hockey.api-sports.io/games?${params.toString()}`;
        
        const res = await fetch(url, {
          headers: { "x-rapidapi-host": "v1.hockey.api-sports.io", "x-rapidapi-key": apiKey }
        });

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];

        if (rawList.length === 0) {
           // FIX: Added (g: any)
           setGames(MOCK_HOCKEY_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
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
        // FIX: Added (g: any)
        setGames(finalData.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);

      } catch (e) {
        console.error(`Hockey feed error:`, e);
        // FIX: Added (g: any)
        setGames(MOCK_HOCKEY_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [leagueId]);

  return <FeedUI games={games} loading={loading} sport="hockey" leagueId={leagueId} />;
}