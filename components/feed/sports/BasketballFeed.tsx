"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BasketballFeedUI from "./BasketballFeedUI";
import { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

function utcTodayYMD() {
  return new Date().toISOString().split("T")[0];
}

function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

// --- BASKETBALL NORMALIZER ---
const normalizeBasketballGame = (rawItem: any): NormalizedGame | null => {
  try {
    const { id, date, status, league, teams, scores, country } = rawItem;

    let homeScore: number | null = null;
    let awayScore: number | null = null;

    if (scores?.home) {
      if (typeof scores.home === "object") homeScore = scores.home.total ?? null;
      else homeScore = scores.home;
    }

    if (scores?.away) {
      if (typeof scores.away === "object") awayScore = scores.away.total ?? null;
      else awayScore = scores.away;
    }

    return {
      id,
      date,
      status: {
        short: status.short,
        long: status.long,
        elapsed: status.timer, // basketball uses timer
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
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const tab = (initialTab || "all").toLowerCase();

  const urlDate = searchParams.get("date");
  const hasUrlDate = isValidYMD(urlDate);

  // ✅ Date rules:
  // - Today tab ALWAYS fetches today's date (and should not show date in URL)
  // - Other tabs fetch ?date= if present, otherwise today's date
  const selectedDate = useMemo(() => {
    if (tab === "today") return today;
    if (hasUrlDate) return urlDate as string;
    return today;
  }, [tab, today, hasUrlDate, urlDate]);

  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBasketball() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_BASKETBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.basketball.api-sports.io";

        const params = new URLSearchParams();
        params.set("date", selectedDate);
        params.set("timezone", "UTC");
        if (leagueId) params.set("league", leagueId);

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

        const res = await fetch(url, { headers } as any);
        const json = await res.json();

        const rawList = Array.isArray(json?.response) ? json.response : [];
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
  }, [leagueId, selectedDate]);

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
