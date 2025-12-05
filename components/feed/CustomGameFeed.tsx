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
  initialTab?: string; // <--- FIX: Defined here
};

export default function CustomGameFeed({ sport = "football", leagueId, initialTab }: CustomGameFeedProps) {
  switch (sport.toLowerCase()) {
    case "football":
      return <FootballFeed leagueId={leagueId} initialTab={initialTab} />;
      
    case "basketball":
    case "nba":
      return <BasketballFeed leagueId={leagueId} initialTab={initialTab} />;
      
    case "nfl":
    case "american-football":
      return <NFLFeed leagueId={leagueId} initialTab={initialTab} />;

    case "baseball":
      return <BaseballFeed leagueId={leagueId} initialTab={initialTab} />;
      
  case "hockey":
   return <HockeyFeed leagueId={leagueId} initialTab={initialTab} />;
      
    case "rugby":
      return <RugbyFeed leagueId={leagueId} initialTab={initialTab} />;
      
    case "volleyball":
      return <VolleyballFeed leagueId={leagueId} initialTab={initialTab} />;
      
    default:
      return (
        <div className="p-10 text-center text-secondary">
          No custom feed available for {sport}.
        </div>
      );
  }
}