import GameWidget from "@/components/widgets/GameWidget";
import { SEO_HOME } from "@/lib/seo/seo-central";

export default function HomePage() {
  const sport = "football";
  const tab = "all";

  return (
    <div className="min-h-screen theme-bg p-4 md:p-6 transition-colors duration-300">
      <h1 className="sr-only">{SEO_HOME.h1}</h1>
      <div className="max-w-7xl mx-auto">
        <GameWidget key={`${sport}-${tab}`} sport={sport} initialTab={tab} />
      </div>
    </div>
  );
}
