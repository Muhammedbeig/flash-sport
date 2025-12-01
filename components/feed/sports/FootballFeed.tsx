"use client";

import { useEffect, useState } from "react";
import FeedUI from "../FeedUI";
import { normalizeGame, NormalizedGame } from "../utils";

export default function FootballFeed({ leagueId }: { leagueId?: string }) {
  const [games, setGames] = useState<NormalizedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFootball() {
      setLoading(true);
      try {
        const cdnUrl = process.env.NEXT_PUBLIC_CDN_FOOTBALL_URL;
        const apiKey = process.env.NEXT_PUBLIC_API_SPORTS_KEY;
        const utcDate = new Date().toISOString().split("T")[0]; // Football uses UTC
        
        let url = "";
        let headers: Record<string, string> = {};
        
        const params = new URLSearchParams();
        params.set("date", utcDate);
        if (leagueId) params.set("league", leagueId);

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
  }, [leagueId]);

  return <FeedUI games={games} loading={loading} sport="football" leagueId={leagueId} />;
}