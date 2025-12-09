"use client";

import { useEffect, useState } from "react";
import RugbyFeedUI from "./RugbyFeedUI";
import { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

const normalizeRugbyGame = (rawItem: any): NormalizedGame | null => {
  try {
    // Rugby API structure: { game: {...}, league: {...}, teams: {...}, scores: {...} }
    const gameData = rawItem.game || rawItem;
    const leagueData = rawItem.league || {};
    const teamsData = rawItem.teams || {};
    const scoresData = rawItem.scores || {};

    // Safety check
    if (!gameData.id) return null;

    let homeScore = scoresData.home;
    let awayScore = scoresData.away;

    return {
      id: gameData.id,
      date: gameData.date,
      status: {
        short: gameData.status?.short || "NS",
        long: gameData.status?.long || "Not Started",
        elapsed: gameData.status?.timer
      },
      league: {
        id: leagueData.id,
        name: leagueData.name,
        country: leagueData.country?.name || leagueData.country || "World",
        logo: leagueData.logo,
        flag: leagueData.flag || null,
      },
      teams: {
        home: { 
          id: teamsData.home.id, 
          name: teamsData.home.name, 
          logo: teamsData.home.logo, 
          winner: undefined // FIX: undefined to match type
        },
        away: { 
          id: teamsData.away.id, 
          name: teamsData.away.name, 
          logo: teamsData.away.logo, 
          winner: undefined // FIX: undefined to match type
        },
      },
      scores: { home: homeScore, away: awayScore },
    };
  } catch (err) {
    console.warn("Rugby normalize error", err);
    return null;
  }
};

type RugbyFeedProps = {
  leagueId?: string;
  initialTab?: string;
};

export default function RugbyFeed({ leagueId, initialTab }: RugbyFeedProps) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRugby() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_RUGBY_URL; 
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.rugby.api-sports.io"; 
        
        const params = new URLSearchParams();
        params.set("timezone", "UTC");
        
        // Rugby uses seasons (e.g. 2024)
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
        const rawList = Array.isArray(json?.response) ? json.response : [];
        
        const cleanList = rawList
          .map(normalizeRugbyGame)
          .filter((g: any): g is NormalizedGame => g !== null);

        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setGames(cleanList);

      } catch (err) {
        console.error("Rugby Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRugby();
  }, [leagueId]);

  if (loading) return <GameFeedSkeleton />;

  return <RugbyFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}