"use client";

import React from "react";
// Import the dedicated widgets we created
import FootballMatchWidget from "@/components/widgets/FootballMatchWidget";
import BasketballMatchWidget from "@/components/widgets/BasketballMatchWidget";
import NFLMatchWidget from "@/components/widgets/NFLMatchWidget";
import BaseballMatchWidget from "@/components/widgets/BaseballMatchWidget";
import HockeyMatchWidget from "@/components/widgets/HockeyMatchWidget";
import RugbyMatchWidget from "@/components/widgets/RugbyMatchWidget";
import VolleyballMatchWidget from "@/components/widgets/VolleyballMatchWidget";

type MatchWidgetProps = {
  matchId: string;
  sport: string;
  initialTab?: string;
};

export default function MatchWidget({ matchId, sport, initialTab }: MatchWidgetProps) {
  // Normalize sport string to handle URL variations (e.g. "nba" -> "basketball")
  const sportKey = sport?.toLowerCase() || "football";

  switch (sportKey) {
    case "football":
    case "soccer":
      return <FootballMatchWidget matchId={matchId} initialTab={initialTab} />;

    case "basketball":
    case "nba":
      return <BasketballMatchWidget matchId={matchId} initialTab={initialTab} />;

    case "nfl":
    case "american-football":
      return <NFLMatchWidget matchId={matchId} initialTab={initialTab} />;

    case "baseball":
    case "mlb":
      return <BaseballMatchWidget matchId={matchId} initialTab={initialTab} />;

    case "hockey":
    case "nhl":
      return <HockeyMatchWidget matchId={matchId} initialTab={initialTab} />;

    case "rugby":
      return <RugbyMatchWidget matchId={matchId} initialTab={initialTab} />;

    case "volleyball":
      return <VolleyballMatchWidget matchId={matchId} initialTab={initialTab} />;

    default:
      // Fallback for unsupported sports
      return (
        <div className="p-10 text-center text-secondary bg-slate-50 dark:bg-slate-900 rounded-xl border theme-border">
          <p>
            Match details not available for <span className="font-bold">{sport}</span>.
          </p>
        </div>
      );
  }
}