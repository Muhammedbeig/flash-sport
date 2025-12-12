import GameWidget from "@/components/widgets/GameWidget";

const VALID_TABS = ["all", "live", "finished", "scheduled"] as const;

function normalizeSport(s: string) {
  return (s || "football").toLowerCase();
}

function normalizeTab(t: string) {
  const tab = (t || "all").toLowerCase();
  return (VALID_TABS as readonly string[]).includes(tab) ? tab : "all";
}

export default async function SportsTabPage({
  params,
}: {
  params: Promise<{ sport: string; tab: string }>;
}) {
  const { sport, tab } = await params;

  const sportSafe = normalizeSport(sport);
  const tabSafe = normalizeTab(tab);

  return (
    <div className="min-h-screen theme-bg p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Force remount so previous sport/tab state never “sticks” */}
        <GameWidget key={`${sportSafe}-${tabSafe}`} sport={sportSafe} initialTab={tabSafe} />
      </div>
    </div>
  );
}
