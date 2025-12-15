"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import VolleyballFeedUI from "./VolleyballFeedUI";
import type { NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

function utcTodayYMD() {
  return new Date().toISOString().split("T")[0];
}
function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

const normalizeVolleyballGame = (rawItem: any): NormalizedGame | null => {
  try {
    const { id, date, status, league, teams, scores, country } = rawItem;
    if (!id) return null;

    let homeScore: any = scores?.home;
    let awayScore: any = scores?.away;

    if (typeof homeScore === "object") homeScore = homeScore?.total ?? null;
    if (typeof awayScore === "object") awayScore = awayScore?.total ?? null;

    return {
      id,
      date,
      status: {
        short: status?.short || "NS",
        long: status?.long || "Not Started",
        elapsed: undefined,
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
    } as NormalizedGame;
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
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const tab = (initialTab || "all").toLowerCase();

  const urlDate = searchParams.get("date");
  const hasUrlDate = isValidYMD(urlDate);

  // Today ignores ?date; calendar uses ?date; default loads today but without url
  const selectedDate = useMemo(() => {
    if (tab === "today") return today;
    if (hasUrlDate) return urlDate as string;
    return today;
  }, [tab, today, hasUrlDate, urlDate]);

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

        // Preserve existing behavior for league pages: season-based
        // Add date mode when ?date exists OR Today tab is used
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

        if (json?.errors && Object.keys(json.errors).length > 0) {
          const msg =
            typeof json.errors === "object"
              ? Object.values(json.errors).join(", ")
              : "An error occurred fetching data.";
          throw new Error(msg);
        }

        const rawList: any[] = Array.isArray(json?.response) ? json.response : [];

        const cleanList: NormalizedGame[] = rawList
          .map(normalizeVolleyballGame)
          .filter((g): g is NormalizedGame => g !== null);

        cleanList.sort((a: NormalizedGame, b: NormalizedGame) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setGames(cleanList);
      } catch (err: any) {
        console.error("Volleyball Feed Error:", err);
        setError(err?.message || "Failed to load matches.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVolleyball();
  }, [leagueId, hasUrlDate, selectedDate, tab]);

  if (loading) return <GameFeedSkeleton />;

  return (
    <VolleyballFeedUI
      games={games}
      loading={loading}
      error={error}
      leagueId={leagueId}
      initialTab={initialTab}
    />
  );
}
