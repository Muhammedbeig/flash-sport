"use client";

import { useEffect, useState } from "react";
import HockeyFeedUI from "./HockeyFeedUI";
import { NormalizedGame } from "../utils";

// --- HOCKEY NORMALIZER ---
const normalizeHockeyGame = (rawItem: any): NormalizedGame | null => {
  try {
    // Hockey API: { game: {...}, league: {...}, teams: {...}, scores: {...} }
    // OR flat structure depending on endpoint
    const game = rawItem.game || rawItem;
    const league = rawItem.league || {};
    const teams = rawItem.teams || {};
    const scores = rawItem.scores || {};

    if (!game.id) return null;

    // Scores in Hockey are usually simple integers (scores.home, scores.away)
    // But for consistency, we handle object wrappers if they appear.
    let homeScore = scores.home;
    let awayScore = scores.away;
    
    // Sometimes total score is nested (rare in Hockey v1 but safe to check)
    if (typeof homeScore === "object") homeScore = homeScore?.total ?? null;
    if (typeof awayScore === "object") awayScore = awayScore?.total ?? null;

    return {
      id: game.id,
      date: game.date,
      status: {
        short: game.status?.short || "NS",
        long: game.status?.long || "Not Started",
        elapsed: game.status?.timer
      },
      league: {
        id: league.id,
        name: league.name,
        country: league.country?.name || league.country || "World",
        logo: league.logo,
        flag: league.flag || null,
      },
      teams: {
        home: { id: teams.home.id, name: teams.home.name, logo: teams.home.logo, winner: teams.home.winner },
        away: { id: teams.away.id, name: teams.away.name, logo: teams.away.logo, winner: teams.away.winner },
      },
      scores: { home: homeScore, away: awayScore },
    };
  } catch (err) {
    console.warn("Error normalizing Hockey game:", err);
    return null;
  }
};

type HockeyFeedProps = {
  leagueId?: string;
  initialTab?: string;
};

export default function HockeyFeed({ leagueId, initialTab }: HockeyFeedProps) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHockey() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_HOCKEY_URL; 
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.hockey.api-sports.io"; 
        
        const params = new URLSearchParams();
        params.set("timezone", "UTC");
        
        if (leagueId) {
          params.set("league", leagueId);
          params.set("season", "2023"); // Hockey season usually spans years, check current
        } else {
          const utcDate = new Date().toISOString().split("T")[0]; 
          params.set("date", utcDate);
        }

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/games?${params.toString()}`;
        } else {
          url = `https://${host}/games?${params.toString()}`; 
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers, next: { revalidate: 60 } });
        const json = await res.json();
        
        const rawList = Array.isArray(json?.response) ? json.response : [];
        
        const cleanList = rawList
          .map(normalizeHockeyGame)
          .filter((g: any): g is NormalizedGame => g !== null);

        // Sort by Date
        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setGames(cleanList);

      } catch (err) {
        console.error("Hockey Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHockey();
  }, [leagueId]);

  return <HockeyFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}