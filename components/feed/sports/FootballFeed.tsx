"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";
import { GameFeedSkeleton } from "@/components/match/skeletons/GameFeedSkeleton";

function utcTodayYMD() {
  return new Date().toISOString().split("T")[0];
}
function isValidYMD(v: string | null) {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

export default function FootballFeed({ leagueId, initialTab }: { leagueId?: string; initialTab?: string }) {
  const searchParams = useSearchParams();

  const today = useMemo(() => utcTodayYMD(), []);
  const tab = (initialTab || "all").toLowerCase();

  const urlDate = searchParams.get("date");
  const selectedDate = useMemo(() => {
    if (tab === "today") return today;              // Today = real today only
    if (isValidYMD(urlDate)) return urlDate as string; // calendar filter
    return today;                                  // default
  }, [tab, today, urlDate]);

  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFootball() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;

        const params = new URLSearchParams();
        params.set("date", selectedDate);
        if (leagueId) params.set("league", leagueId);

        let url = "";
        let headers: Record<string, string> = {};

        if (cdnUrl) {
          url = `${cdnUrl.replace(/\/$/, "")}/fixtures?${params.toString()}`;
        } else {
          url = `https://v3.football.api-sports.io/fixtures?${params.toString()}`;
          headers = {
            "x-rapidapi-host": "v3.football.api-sports.io",
            "x-rapidapi-key": apiKey || "",
          };
        }

        const res = await fetch(url, { headers });
        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];
        setGames(rawList.map(normalizeGame).filter((g: any) => g !== null));
      } catch (err) {
        console.error("Football feed error", err);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFootball();
  }, [leagueId, selectedDate]);

  if (loading) return <GameFeedSkeleton />;

  return <FeedUI games={games} loading={loading} sport="football" leagueId={leagueId} initialTab={initialTab} />;
}
