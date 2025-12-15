"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import NFLFeedUI from "./NFLFeedUI";
import type { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

function utcTodayYMD() {
  return new Date().toISOString().split("T")[0];
}
function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

// --- NFL NORMALIZER ---
const normalizeNFLGame = (rawItem: any): NormalizedGame | null => {
  try {
    const game = rawItem?.game || rawItem;
    const league = rawItem?.league || {};
    const teams = rawItem?.teams || {};
    const scores = rawItem?.scores || {};

    if (!game?.id) return null;

    const homeScore =
      typeof scores?.home === "object" ? (scores.home?.total ?? null) : (scores?.home ?? null);
    const awayScore =
      typeof scores?.away === "object" ? (scores.away?.total ?? null) : (scores?.away ?? null);

    return {
      id: game.id,
      date: game.date,
      status: {
        short: game.status?.short || "NS",
        long: game.status?.long || "Not Started",
        elapsed: game.status?.timer,
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
          id: teams.home?.id,
          name: teams.home?.name,
          logo: teams.home?.logo,
          winner: undefined,
        },
        away: {
          id: teams.away?.id,
          name: teams.away?.name,
          logo: teams.away?.logo,
          winner: undefined,
        },
      },
      scores: {
        home: homeScore,
        away: awayScore,
      },
    } as NormalizedGame;
  } catch {
    return null;
  }
};

type NFLFeedProps = {
  leagueId?: string;
  initialTab?: string;
};

export default function NFLFeed({ leagueId, initialTab }: NFLFeedProps) {
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const tab = (initialTab || "all").toLowerCase();

  const urlDate = searchParams.get("date");
  const hasUrlDate = isValidYMD(urlDate);

  const selectedDate = useMemo(() => {
    if (tab === "today") return today;
    if (hasUrlDate) return urlDate as string;
    return today;
  }, [tab, today, hasUrlDate, urlDate]);

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

        if (leagueId) {
          params.set("league", leagueId);

          // keep your existing behavior
          if (hasUrlDate || tab === "today") {
            params.set("date", selectedDate);
            params.set("season", selectedDate.slice(0, 4));
          } else {
            params.set("season", "2024");
          }
        } else {
          params.set("date", selectedDate);
        }

        let url = "";
        const headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/games?${params.toString()}`;
        } else {
          url = `https://${host}/games?${params.toString()}`;
          headers["x-rapidapi-host"] = host;
          headers["x-rapidapi-key"] = apiKey || "";
        }

        const res = await fetch(url, { headers } as RequestInit);
        const json = await res.json();

        const rawList: any[] = Array.isArray(json?.response) ? json.response : [];

        const cleanList: NormalizedGame[] = rawList
          .map(normalizeNFLGame)
          .filter((g): g is NormalizedGame => g !== null);

        // ✅ FIX: explicit typing removes implicit-any error
        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setGames(cleanList);
      } catch (err) {
        console.error("NFL Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNFL();
  }, [leagueId, hasUrlDate, selectedDate, tab]);

  if (loading) return <GameFeedSkeleton />;

  return <NFLFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}
