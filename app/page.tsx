import GameWidget from "@/components/widgets/GameWidget";
import MatchModal from "@/components/layout/MatchModal";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  
  // 1. Get the Sport (default: football)
  const sport = (searchParams.sport as string) || "football";
  
  // 2. Determine League ID
  // If the user selected Football, we default to Premier League (39).
  // For other sports, we should NOT send '39' because it's a football league ID.
  // We pass 'undefined' so the widget shows the default list for that sport.
  const leagueId = sport === "football" ? "39" : undefined;

  return (
    <>
      <div className="max-w-3xl mx-auto py-4">
        {/* We pass the 'sport' prop to the widget */}
        <GameWidget 
          key={sport} // Force re-render when sport changes
          sport={sport} 
          leagueId={leagueId} 
        />
      </div>
      <MatchModal />
    </>
  );
}