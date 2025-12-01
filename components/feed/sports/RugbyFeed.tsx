"use client";

import { useEffect, useState } from "react";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";

export default function RugbyFeed({ leagueId }: { leagueId?: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const now = new Date();
        const localDate = now.toLocaleDateString("en-CA");
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        if (!apiKey) { setLoading(false); return; }

        const params = new URLSearchParams();
        params.set("date", localDate);
        params.set("timezone", userTimezone);
        if (leagueId) params.set("league", leagueId);

        const url = `https://v1.rugby.api-sports.io/games?${params.toString()}`;
        
        const res = await fetch(url, {
          headers: {
            "x-rapidapi-host": "v1.rugby.api-sports.io",
            "x-rapidapi-key": apiKey,
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const rawList = Array.isArray(json?.response) ? json.response : [];
        setGames(rawList.map(normalizeGame).filter((g: any) => g !== null));
      } catch (e) {
        console.error(`Rugby feed error:`, e);
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [leagueId]);

  return <FeedUI games={games} loading={loading} sport="rugby" leagueId={leagueId} />;
}