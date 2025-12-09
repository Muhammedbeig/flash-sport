"use client";

import { useEffect, useState } from "react";
import HockeyFeedUI from "./HockeyFeedUI"; // Imports the UI component
import { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

const normalizeHockeyGame = (rawItem: any): NormalizedGame | null => {
  try {
    const { id, date, status, league, teams, scores, country } = rawItem;
    if (!id) return null;

    let homeScore = scores?.home;
    let awayScore = scores?.away;

    // Safety for score objects (Hockey API sometimes wraps them)
    if (typeof homeScore === "object") homeScore = homeScore?.total ?? null;
    if (typeof awayScore === "object") awayScore = awayScore?.total ?? null;

    return {
      id,
      date,
      status: {
        short: status?.short || "NS",
        long: status?.long || "Not Started",
        elapsed: status?.timer
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
    console.error("Hockey Normalize Error", err);
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
        // Host for Hockey API
        const host = "v1.hockey.api-sports.io"; 
        
        const params = new URLSearchParams();
        params.set("timezone", "UTC");
        
        if (leagueId) {
          params.set("league", leagueId);
          params.set("season", "2023"); 
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

  if (loading) return <GameFeedSkeleton />;
  // Renders the UI component with the required props
  return <HockeyFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}