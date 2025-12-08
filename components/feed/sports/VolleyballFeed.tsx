"use client";

import { useEffect, useState } from "react";
import VolleyballFeedUI from "./VolleyballFeedUI";
import { NormalizedGame } from "../utils";

const normalizeVolleyballGame = (rawItem: any): NormalizedGame | null => {
  try {
    const { id, date, status, league, teams, scores, country } = rawItem;
    if (!id) return null;

    let homeScore = scores?.home;
    let awayScore = scores?.away;

    if (typeof homeScore === "object") homeScore = homeScore?.total ?? null;
    if (typeof awayScore === "object") awayScore = awayScore?.total ?? null;

    return {
      id,
      date,
      status: {
        short: status?.short || "NS",
        long: status?.long || "Not Started",
        elapsed: undefined 
      },
      league: {
        id: league.id,
        name: league.name,
        country: country?.name || league.country || "World",
        logo: league.logo,
        flag: country?.flag || league.flag,
      },
      teams: {
        home: { id: teams.home.id, name: teams.home.name, logo: teams.home.logo, winner: teams.home.winner },
        away: { id: teams.away.id, name: teams.away.name, logo: teams.away.logo, winner: teams.away.winner },
      },
      scores: { home: homeScore, away: awayScore },
    };
  } catch (err) {
    console.error("Volleyball Normalize Error", err);
    return null;
  }
};

type VolleyballFeedProps = {
  leagueId?: string;
  initialTab?: string;
};

export default function VolleyballFeed({ leagueId, initialTab }: VolleyballFeedProps) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVolleyball() {
      setLoading(true);
      setError(null);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_VOLLEYBALL_URL; 
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.volleyball.api-sports.io"; 
        
        const params = new URLSearchParams();
        params.set("timezone", "UTC");
        
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
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers, next: { revalidate: 60 } });
        const json = await res.json();

        // Check for API-level errors (Rate Limit, etc.)
        if (json.errors && Object.keys(json.errors).length > 0) {
            // json.errors can be an object { rateLimit: "..." } or array
            const msg = typeof json.errors === 'object' 
                ? Object.values(json.errors).join(', ') 
                : "An error occurred fetching data.";
            throw new Error(msg);
        }
        
        const rawList = Array.isArray(json?.response) ? json.response : [];
        
        const cleanList = rawList
          .map(normalizeVolleyballGame)
          .filter((g: any): g is NormalizedGame => g !== null);

        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setGames(cleanList);

      } catch (err: any) {
        console.error("Volleyball Feed Error:", err);
        setError(err.message || "Failed to load matches.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVolleyball();
  }, [leagueId]);

  return <VolleyballFeedUI games={games} loading={loading} error={error} leagueId={leagueId} initialTab={initialTab} />;
}