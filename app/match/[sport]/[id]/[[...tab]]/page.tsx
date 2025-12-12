import MatchWidget from "@/components/match/MatchWidget";

type RouteParams = {
  sport: string;
  id: string;
  tab?: string[];
};

type PageProps = {
  // Next.js 16: params is a Promise in server route handlers
  params: Promise<RouteParams>;
};

function normalizeSport(raw?: string) {
  const s = (raw || "football").toLowerCase();

  // keep your existing slugs working if any alias exists in URLs
  if (s === "soccer") return "football";
  if (s === "ice-hockey") return "hockey";
  if (s === "american-football") return "nfl";

  return s;
}

export default async function MatchPage({ params }: PageProps) {
  const { sport, id, tab } = await params;

  const sportSlug = normalizeSport(sport);
  const matchId = String(id || "");
  const initialTab = tab?.[0] || "summary";

  // Basic guard (prevents “Invalid Match ID” due to undefined/empty)
  if (!matchId) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="theme-bg theme-border border rounded-xl p-6 text-center text-secondary">
          Invalid Match ID provided.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-2 md:p-0">
      <MatchWidget matchId={matchId} sport={sportSlug} initialTab={initialTab} />
    </div>
  );
}
