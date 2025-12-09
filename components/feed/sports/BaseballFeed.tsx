"use client";

import { useEffect, useState } from "react";
import BaseballFeedUI from "./BaseballFeedUI";
import { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

const normalizeBaseballGame = (rawItem: any): NormalizedGame | null => {
  try {
    const { id, date, status, league, teams, scores, country } = rawItem;
    if (!id) return null;

    // Baseball scores: scores.home.total
    let homeScore = null;
    let awayScore = null;

    if (scores?.home) homeScore = typeof scores.home === "object" ? scores.home.total ?? null : scores.home;
    if (scores?.away) awayScore = typeof scores.away === "object" ? scores.away.total ?? null : scores.away;

    return {
      id,
      date,
      // FIX: 'elapsed' must be undefined, not null
      status: { 
        short: status.short, 
        long: status.long, 
        elapsed: undefined 
      }, 
      league: {
        id: league.id,
        name: league.name,
        country: country?.name || league.country || "USA",
        logo: league.logo,
        flag: country?.flag || league.flag,
      },
      teams: {
        home: { id: teams.home.id, name: teams.home.name, logo: teams.home.logo, winner: teams.home.winner },
        away: { id: teams.away.id, name: teams.away.name, logo: teams.away.logo, winner: teams.away.winner },
      },
      scores: { home: homeScore, away: awayScore },
    };
  } catch (e) {
    return null;
  }
};

export default function BaseballFeed({ leagueId, initialTab }: { leagueId?: string, initialTab?: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBaseball() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_BASEBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.baseball.api-sports.io"; 
        
        const params = new URLSearchParams();
        params.set("timezone", "UTC");

        // Strategy: Season for League view, Date for Main view
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
          .map(normalizeBaseballGame)
          .filter((g: any): g is NormalizedGame => g !== null);

        // Sort by Date
        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setGames(cleanList);

      } catch (err) {
        console.error("Baseball Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchBaseball();
  }, [leagueId]);

  if (loading) return <GameFeedSkeleton />;

  return <BaseballFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}