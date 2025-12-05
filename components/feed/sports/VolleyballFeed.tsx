"use client";

import { useEffect, useState } from "react";
import RugbyFeedUI from "./RugbyFeedUI"; // Ensure this file exists
import { NormalizedGame } from "../utils";

const normalizeRugbyGame = (rawItem: any): NormalizedGame | null => {
  try {
    const gameData = rawItem.game || rawItem;
    const leagueData = rawItem.league || {};
    const teamsData = rawItem.teams || {};
    const scoresData = rawItem.scores || {};

    if (!gameData.id) return null;

    return {
      id: gameData.id,
      date: gameData.date,
      status: {
        short: gameData.status?.short || "NS",
        long: gameData.status?.long || "Not Started",
        elapsed: gameData.status?.timer || undefined // FIX: undefined
      },
      league: {
        id: leagueData.id,
        name: leagueData.name,
        country: leagueData.country?.name || leagueData.country || "World",
        logo: leagueData.logo,
        flag: leagueData.flag || null,
      },
      teams: {
        home: { id: teamsData.home.id, name: teamsData.home.name, logo: teamsData.home.logo, winner: undefined }, // FIX: undefined
        away: { id: teamsData.away.id, name: teamsData.away.name, logo: teamsData.away.logo, winner: undefined }, // FIX: undefined
      },
      scores: { home: scoresData.home, away: scoresData.away },
    };
  } catch (err) {
    return null;
  }
};

// FIX: Added initialTab to props
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

  return <RugbyFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}