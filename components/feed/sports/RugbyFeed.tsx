"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RugbyFeedUI from "./RugbyFeedUI";
import type { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

function utcTodayYMD() {
  return new Date().toISOString().split("T")[0];
}
function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

const normalizeRugbyGame = (rawItem: any): NormalizedGame | null => {
  try {
    // Rugby API structure: { game: {...}, league: {...}, teams: {...}, scores: {...} }
    const gameData = rawItem?.game || rawItem;
    const leagueData = rawItem?.league || {};
    const teamsData = rawItem?.teams || {};
    const scoresData = rawItem?.scores || {};

    if (!gameData?.id) return null;

    const homeScore = scoresData?.home ?? null;
    const awayScore = scoresData?.away ?? null;

    return {
      id: gameData.id,
      date: gameData.date,
      status: {
        short: gameData.status?.short || "NS",
        long: gameData.status?.long || "Not Started",
        elapsed: gameData.status?.timer,
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
          id: teamsData?.home?.id,
          name: teamsData?.home?.name,
          logo: teamsData?.home?.logo,
          winner: undefined,
        },
        away: {
          id: teamsData?.away?.id,
          name: teamsData?.away?.name,
          logo: teamsData?.away?.logo,
          winner: undefined,
        },
      },
      scores: { home: homeScore, away: awayScore },
    } as NormalizedGame;
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
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const tab = (initialTab || "all").toLowerCase();

  const urlDate = searchParams.get("date");
  const hasUrlDate = isValidYMD(urlDate);

  // Rules:
  // - Today tab always uses real today (ignores ?date)
  // - Date in URL is used only when calendar applied (?date)
  // - Default (clean URL) still loads today's feed
  const selectedDate = useMemo(() => {
    if (tab === "today") return today;
    if (hasUrlDate) return urlDate as string;
    return today;
  }, [tab, today, hasUrlDate, urlDate]);

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

        // Keep existing behavior for league pages: season-based
        // Add date-based fetch when calendar applied OR when using Today tab
        if (leagueId) {
          params.set("league", leagueId);

          if (hasUrlDate || tab === "today") {
            params.set("date", selectedDate);
            params.set("season", selectedDate.slice(0, 4));
          } else {
            params.set("season", "2024");
          }
        } else {
          // Main feed: date-based
          params.set("date", selectedDate);
        }

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/games?${params.toString()}`;
        } else {
          url = `https://${host}/games?${params.toString()}`;
          headers = { "x-rapidapi-host": host, "x-rapidapi-key": apiKey || "" };
        }

        const res = await fetch(url, { headers } as RequestInit);
        const json = await res.json();
        const rawList: any[] = Array.isArray(json?.response) ? json.response : [];

        const cleanList: NormalizedGame[] = rawList
          .map(normalizeRugbyGame)
          .filter((g): g is NormalizedGame => g !== null);

        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setGames(cleanList);
      } catch (err) {
        console.error("Rugby Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRugby();
  }, [leagueId, hasUrlDate, selectedDate, tab]);

  if (loading) return <GameFeedSkeleton />;

  return <RugbyFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}
