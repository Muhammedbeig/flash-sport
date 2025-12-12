import GameWidget from "@/components/widgets/GameWidget";
import { SEO_CONTENT } from "@/lib/seo-config";

export default function HomePage() {
  // Homepage default (SEO-safe): show the same default feed as /sports/football/all
  const sport = "football";
  const tab = "all";

  return (
    <div className="min-h-screen theme-bg p-4 md:p-6 transition-colors duration-300">
      <h1 className="sr-only">{SEO_CONTENT?.home?.headings?.h1 ?? "Live Scores"}</h1>

      <div className="max-w-7xl mx-auto">
        <GameWidget key={`${sport}-${tab}`} sport={sport} initialTab={tab} />
      </div>
    </div>
  );
}
