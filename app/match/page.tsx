import MatchWidget from "@/components/widgets/MatchWidget";

type MatchContentProps = {
  matchId: number;
  sport: string;
};

function MatchContent({ matchId, sport }: MatchContentProps) {
  return (
    <div className="px-2 sm:px-4 lg:px-0 py-4">
      {/* Container for the match details widget */}
      <div className="theme-bg rounded-xl shadow-sm border theme-border overflow-hidden min-h-[600px]">
        <MatchWidget matchId={matchId} sport={sport} />
      </div>
    </div>
  );
}

export default function MatchPage({
  searchParams,
}: {
  searchParams: { id?: string; sport?: string };
}) {
  const rawId = searchParams.id;
  const sport = searchParams.sport || "football";

  // Convert id string -> number
  const matchId = rawId ? Number(rawId) : NaN;

  // If id is missing or invalid, show a simple message (prevents runtime errors)
  if (!rawId || Number.isNaN(matchId)) {
    return (
      <div className="px-4 py-8 text-center text-secondary">
        Invalid or missing match ID.
      </div>
    );
  }

  return <MatchContent matchId={matchId} sport={sport} />;
}
