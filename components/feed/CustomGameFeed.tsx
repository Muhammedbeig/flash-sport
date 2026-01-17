"use client";

import FootballFeed from "./sports/FootballFeed";
import BasketballFeed from "./sports/BasketballFeed";
import NFLFeed from "./sports/NFLFeed";
import BaseballFeed from "./sports/BaseballFeed";
import HockeyFeed from "./sports/HockeyFeed";
import RugbyFeed from "./sports/RugbyFeed";
import VolleyballFeed from "./sports/VolleyballFeed";

type CustomGameFeedProps = {
  sport?: string;
  leagueId?: string;
  initialTab?: string;
};

export default function CustomGameFeed({ sport = "football", leagueId, initialTab }: CustomGameFeedProps) {
  const sportKey = sport.toLowerCase();

  switch (sportKey) {
    case "football":
    case "soccer":
      return <FootballFeed leagueId={leagueId} initialTab={initialTab} />;

    case "basketball":
    case "nba":
      return <BasketballFeed leagueId={leagueId} initialTab={initialTab} />;

    case "nfl":
    case "american-football":
      return <NFLFeed leagueId={leagueId} initialTab={initialTab} />;

    case "baseball":
    case "mlb":
      return <BaseballFeed leagueId={leagueId} initialTab={initialTab} />;

    case "hockey":
    case "nhl":
      return <HockeyFeed leagueId={leagueId} initialTab={initialTab} />;

    case "rugby":
      return <RugbyFeed leagueId={leagueId} initialTab={initialTab} />;

    case "volleyball":
      return <VolleyballFeed leagueId={leagueId} initialTab={initialTab} />;

    default:
      return (
        <div className="p-10 text-center text-secondary bg-slate-50 dark:bg-slate-900 rounded-xl border theme-border">
          <p>
            No custom feed available for <span className="font-bold">{sport}</span>.
          </p>
        </div>
      );
  }
}
