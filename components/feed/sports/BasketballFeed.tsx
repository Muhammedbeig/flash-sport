"use client";

import { useEffect, useState } from "react";
// FIX: Relative imports to prevent module resolution errors
import BasketballFeedUI from "./BasketballFeedUI";
import { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

// --- BASKETBALL NORMALIZER ---
const normalizeBasketballGame = (rawItem: any): NormalizedGame | null => {
  try {
    const { id, date, status, league, teams, scores, country } = rawItem;

    let homeScore = null;
    let awayScore = null;

    // Basketball API returns scores as objects sometimes (e.g. { quarter_1: 10, total: 50 })
    // We must extract the 'total' or fallback to null safely.
    if (scores?.home) {
      if (typeof scores.home === "object") {
        homeScore = scores.home.total ?? null;
      } else {
        homeScore = scores.home;
      }
    }

    if (scores?.away) {
      if (typeof scores.away === "object") {
        awayScore = scores.away.total ?? null;
      } else {
        awayScore = scores.away;
      }
    }

    return {
      id: id,
      date: date,
      status: {
        short: status.short, 
        long: status.long,
        elapsed: status.timer // API-Basketball uses 'timer' field
      },
      league: {
        id: league.id,
        name: league.name,
        country: country?.name || league.country || "World",
        logo: league.logo,
        flag: country?.flag || league.flag,
      },
      teams: {
        home: {
          id: teams.home.id,
          name: teams.home.name,
          logo: teams.home.logo,
          winner: teams.home.winner,
        },
        away: {
          id: teams.away.id,
          name: teams.away.name,
          logo: teams.away.logo,
          winner: teams.away.winner,
        },
      },
      scores: {
        home: homeScore, 
        away: awayScore,
      },
    };
  } catch (err) {
    console.warn("Error normalizing basketball game:", err);
    return null;
  }
};

type BasketballFeedProps = {
  leagueId?: string;
  initialTab?: string;
};

export default function BasketballFeed({ leagueId, initialTab }: BasketballFeedProps) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBasketball() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_BASKETBALL_URL; 
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.basketball.api-sports.io"; 
        
        // Fetch Today's games
        const utcDate = new Date().toISOString().split("T")[0]; 

        const params = new URLSearchParams();
        params.set("date", utcDate);
        params.set("timezone", "UTC");
        
        if (leagueId) {
            params.set("league", leagueId);
        }

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/games?${params.toString()}`;
        } else {
          url = `https://${host}/games?${params.toString()}`; 
          headers = {
            "x-rapidapi-host": host,
            "x-rapidapi-key": apiKey || "",
          };
        }

        const res = await fetch(url, { headers, next: { revalidate: 60 } });
        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];
        
        // Filter out nulls safely
        const cleanList = rawList
          .map(normalizeBasketballGame)
          .filter((g: any): g is NormalizedGame => g !== null);

        setGames(cleanList);

      } catch (err) {
        console.error("Basketball feed error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBasketball();
  }, [leagueId]);

  if (loading) return <GameFeedSkeleton />;
  
  return (
    <BasketballFeedUI 
      games={games} 
      loading={loading} 
      leagueId={leagueId}
      initialTab={initialTab}
    />
  );
}