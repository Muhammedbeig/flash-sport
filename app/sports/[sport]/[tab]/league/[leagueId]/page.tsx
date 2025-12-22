import GameWidget from "@/components/widgets/GameWidget";
import { notFound } from "next/navigation";

// ✅ FIX: Added missing tabs (results, fixtures, standings, etc.)
// This ensures /league/906/results loads the Results tab, not Summary.
const VALID_TABS = [
  "all", 
  "today", 
  "live", 
  "finished", 
  "scheduled", 
  "results", 
  "fixtures", 
  "standings"
] as const;

function normalizeSport(s: string) {
  return (s || "football").toLowerCase();
}

function normalizeTab(t: string) {
  const tab = (t || "all").toLowerCase();
  // @ts-ignore - straightforward string check
  return VALID_TABS.includes(tab) ? tab : "all";
}

type Props = {
  params: Promise<{
    sport: string;
    tab: string;
    leagueId: string;
  }>;
};

export default async function SportsLeagueTabPage({ params }: Props) {
  const { sport, tab, leagueId } = await params;
  
  const sportSafe = normalizeSport(sport);
  const tabSafe = normalizeTab(tab);

  // Optional: Validation to ensure ID is numeric (prevents errors)
  if (!leagueId || !/^\d+$/.test(leagueId)) {
    // return notFound(); 
  }

  return (
    <div className="min-h-screen theme-bg p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Key is crucial: It forces the Widget to re-render 
            when you switch tabs or leagues.
        */}
        <GameWidget
          key={`${sportSafe}-${leagueId}-${tabSafe}`}
          sport={sportSafe}
          leagueId={leagueId}
          initialTab={tabSafe}
        />
      </div>
    </div>
  );
}