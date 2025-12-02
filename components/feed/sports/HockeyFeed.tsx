"use client";

import { useEffect, useState } from "react";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";

// 1. ROBUST MOCK DATA (Inheriting the media URL pattern)
const MOCK_HOCKEY_GAMES = [
  {
    game: { id: 10, date: new Date().toISOString(), status: { short: "FT", long: "Finished" } },
    league: { 
      id: 57, 
      name: "NHL", 
      country: "USA", 
      logo: "https://media.api-sports.io/hockey/leagues/57.png" 
    },
    teams: { 
      home: { 
        id: 1, 
        name: "Bruins", 
        logo: "https://media.api-sports.io/hockey/teams/1.png" 
      }, 
      away: { 
        id: 2, 
        name: "Rangers", 
        logo: "https://media.api-sports.io/hockey/teams/2.png" 
      } 
    },
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
        if (!apiKey) throw new Error("No API Key");

        // 2. CONFIGURATION: Fetch by Season (Pattern Inheritance)
        // Instead of fetching just "Today", we fetch the league's season.
        // This guarantees we get data, which we then filter locally.
        const targetLeague = leagueId || "57"; // Default to NHL if no league selected
        const season = "2023"; // Hockey uses 4-digit years (e.g., 2023 for 2023-2024 season) [cite: 4119]
        
        const params = new URLSearchParams();
        params.set("league", targetLeague);
        params.set("season", season);
        params.set("timezone", "UTC"); // Consistent timezone

        const url = `https://v1.hockey.api-sports.io/games?${params.toString()}`;
        
        // 3. HEADER COMPLIANCE
        // Docs explicitly state: "allows only the headers listed below: x-apisports-key" 
        const res = await fetch(url, {
          headers: { 
            "x-apisports-key": apiKey 
          }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];

        // 4. FALLBACK: If empty, show Mock
        if (rawList.length === 0) {
           console.warn("Hockey API empty, using mock.");
           setGames(MOCK_HOCKEY_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
           return;
        }

        // 5. CLIENT-SIDE FILTERING (Smart Logic)
        // Filter for games +/- 7 days from now
        const now = new Date();
        const past = new Date(now); past.setDate(now.getDate() - 7);
        const future = new Date(now); future.setDate(now.getDate() + 7);

        const filtered = rawList.filter((item: any) => {
          const d = new Date(item.game?.date || item.date);
          return d >= past && d <= future;
        });

        // 6. "ZERO MATCH" FIX
        // If the 7-day window is empty, show the last 15 games of the season so the feed is never blank.
        const finalData = filtered.length > 0 ? filtered : rawList.slice(-15);
        
        setGames(finalData.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);

      } catch (e) {
        console.error(`Hockey feed error:`, e);
        setGames(MOCK_HOCKEY_GAMES.map(normalizeGame).filter((g: any) => g !== null) as NormalizedGame[]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [leagueId]);

  return <FeedUI games={games} loading={loading} sport="hockey" leagueId={leagueId} />;
}