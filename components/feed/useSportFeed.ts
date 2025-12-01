"use client";

import { useEffect, useState } from "react";
import { normalizeGame, NormalizedGame } from "./utils";

export function useSportFeed(sport: string, host: string, endpoint: string, leagueId?: string) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const now = new Date();
        const localDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        if (!apiKey) throw new Error("Missing API Key");

        const params = new URLSearchParams();
        params.set("date", localDate);
        params.set("timezone", userTimezone);
        if (leagueId) params.set("league", leagueId);

        const url = `https://${host}/${endpoint}?${params.toString()}`;
        
        const res = await fetch(url, {
          headers: {
            "x-rapidapi-host": host,
            "x-rapidapi-key": apiKey,
          },
        });

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];
        setGames(rawList.map(normalizeGame).filter((g: any) => g !== null));
      } catch (e) {
        console.error(`${sport} feed error:`, e);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [sport, host, endpoint, leagueId]);

  return { games, loading };
}