"use client";

import { useEffect, useState } from "react";
import NFLFeedUI from "@/components/feed/NFLFeedUI";
import { NormalizedGame } from "../utils";

// --- NFL NORMALIZER ---
const normalizeNFLGame = (rawItem: any): NormalizedGame | null => {
  try {
    // Structure is usually { game: {...}, league: {...}, teams: {...}, scores: {...} }
    const game = rawItem.game || rawItem;
    const league = rawItem.league || {};
    const teams = rawItem.teams || {};
    const scores = rawItem.scores || {};

    // Safety check: Must have an ID
    if (!game.id) return null;

    // Score Extraction
    let homeScore = null;
    let awayScore = null;

    if (scores?.home) {
      homeScore = typeof scores.home === "object" ? scores.home.total ?? null : scores.home;
    }
    if (scores?.away) {
      awayScore = typeof scores.away === "object" ? scores.away.total ?? null : scores.away;
    }

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
        country: league.country?.name || league.country || "USA",
        logo: league.logo,
        flag: league.flag || null,
      },
      teams: {
        home: {
          id: teams.home.id,
          name: teams.home.name,
          logo: teams.home.logo,
          // FIX: Explicitly use undefined to match NormalizedTeam type
          winner: undefined 
        },
        away: {
          id: teams.away.id,
          name: teams.away.name,
          logo: teams.away.logo,
          // FIX: Explicitly use undefined to match NormalizedTeam type
          winner: undefined 
        },
      },
      scores: {
        home: homeScore,
        away: awayScore
      },
    };
  } catch (err) {
    console.warn("Error normalizing NFL game:", err);
    return null;
  }
};

type NFLFeedProps = {
  leagueId?: string;
  initialTab?: string;
};

export default function NFLFeed({ leagueId, initialTab }: NFLFeedProps) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNFL() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_NFL_URL; 
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.american-football.api-sports.io"; 
        
        const params = new URLSearchParams();
        params.set("timezone", "UTC");
        
        // 1. League View: Fetch Season 2024
        // 2. Main Feed: Fetch Date (Today)
        if (leagueId) {
          params.set("league", leagueId);
          params.set("season", "2024"); 
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
          headers = { 
            "x-rapidapi-host": host, 
            "x-rapidapi-key": apiKey || "" 
          };
        }

        const res = await fetch(url, { headers, next: { revalidate: 60 } });
        const json = await res.json();
        
        const rawList = Array.isArray(json?.response) ? json.response : [];
        
        const cleanList = rawList
          .map(normalizeNFLGame)
          .filter((g: any): g is NormalizedGame => g !== null);

        // Sort: Newest first
        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setGames(cleanList);

      } catch (err) {
        console.error("NFL Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNFL();
  }, [leagueId]);

  return (
    <NFLFeedUI 
      games={games} 
      loading={loading} 
      leagueId={leagueId} 
      initialTab={initialTab} 
    />
  );
}