"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HockeyFeedUI from "./HockeyFeedUI";
import { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

function utcTodayYMD() {
  return new Date().toISOString().split("T")[0];
}
function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

const normalizeHockeyGame = (rawItem: any): NormalizedGame | null => {
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
        elapsed: status?.timer,
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
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const tab = (initialTab || "all").toLowerCase();

  const urlDate = searchParams.get("date");
  const hasUrlDate = isValidYMD(urlDate);

  // Today tab always uses real today (ignores ?date)
  const selectedDate = useMemo(() => {
    if (tab === "today") return today;
    if (hasUrlDate) return urlDate as string;
    return today;
  }, [tab, today, hasUrlDate, urlDate]);

  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHockey() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_HOCKEY_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const host = "v1.hockey.api-sports.io";

        const params = new URLSearchParams();
        params.set("timezone", "UTC");

        if (leagueId) {
          params.set("league", leagueId);

          // Keep old behavior unless user applies calendar date OR uses Today tab
          if (hasUrlDate || tab === "today") {
            params.set("date", selectedDate);
            params.set("season", selectedDate.slice(0, 4));
          } else {
            params.set("season", "2023");
          }
        } else {
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

        const res = await fetch(url, { headers } as any);
        const json = await res.json();

        const rawList = Array.isArray(json?.response) ? json.response : [];
        const cleanList = rawList
          .map(normalizeHockeyGame)
          .filter((g: any): g is NormalizedGame => g !== null);

        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setGames(cleanList);
      } catch (err) {
        console.error("Hockey Feed Error:", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHockey();
  }, [leagueId, hasUrlDate, selectedDate, tab]);

  if (loading) return <GameFeedSkeleton />;

  return <HockeyFeedUI games={games} loading={loading} leagueId={leagueId} initialTab={initialTab} />;
}
