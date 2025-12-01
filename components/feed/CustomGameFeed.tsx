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
};

export default function CustomGameFeed({ sport = "football", leagueId }: CustomGameFeedProps) {
  switch (sport.toLowerCase()) {
    case "football":
      return <FootballFeed leagueId={leagueId} />;
    case "basketball":
    case "nba": // Handle both 'nba' and 'basketball' routing just in case
      return <BasketballFeed leagueId={leagueId} />;
    case "nfl":
    case "american-football":
      return <NFLFeed leagueId={leagueId} />;
    case "baseball":
      return <BaseballFeed leagueId={leagueId} />;
    case "hockey":
      return <HockeyFeed leagueId={leagueId} />;
    case "rugby":
      return <RugbyFeed leagueId={leagueId} />;
    case "volleyball":
      return <VolleyballFeed leagueId={leagueId} />;
    default:
      return (
        <div className="p-10 text-center text-secondary">
          No custom feed available for {sport}.
        </div>
      );
  }
}