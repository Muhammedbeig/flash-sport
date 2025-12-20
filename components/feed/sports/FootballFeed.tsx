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
    if (tab === "today") return today; // Today = real today only
    if (isValidYMD(urlDate)) return urlDate as string; // calendar filter
    return today; // default
  }, [tab, today, urlDate]);

  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchFootball() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("date", selectedDate);
        if (leagueId) params.set("league", leagueId);

        // ✅ IMPORTANT: Fetch through our server proxy (avoids CORS + hides direct upstream)
        const res = await fetch(`/api/feed/football?${params.toString()}`, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`Football feed HTTP ${res.status}`);
        }

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];
        const normalized = rawList.map(normalizeGame).filter((g: any) => g !== null);

        if (!cancelled) setGames(normalized);
      } catch (err) {
        console.error("Football feed error", err);
        if (!cancelled) setGames([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFootball();
    return () => {
      cancelled = true;
    };
  }, [leagueId, selectedDate]);

  if (loading) return <GameFeedSkeleton />;

  return <FeedUI games={games} loading={loading} sport="football" leagueId={leagueId} initialTab={initialTab} />;
}
