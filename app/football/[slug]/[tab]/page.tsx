import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FOOTBALL_ROUTES } from "@/lib/seo-routes";
import GameWidget from "@/components/widgets/GameWidget";
import { Skeleton } from "@/components/ui/Skeleton";

export function generateStaticParams() {
  const tabs = ["summary", "results", "fixtures", "standings"];
  const paths = [];
  for (const slug of Object.keys(FOOTBALL_ROUTES.leagues)) {
    for (const tab of tabs) {
      paths.push({ slug, tab });
    }
  }
  return paths;
}

type Props = {
  params: Promise<{ slug: string; tab: string }>;
};

export default async function LeagueTabSeoPage({ params }: Props) {
  const { slug, tab } = await params;

  if (!(slug in FOOTBALL_ROUTES.leagues)) return notFound();
  
  const validTabs = ["summary", "results", "fixtures", "standings"];
  if (!validTabs.includes(tab)) return notFound();

  const leagueId = FOOTBALL_ROUTES.leagues[slug as keyof typeof FOOTBALL_ROUTES.leagues];

  return (
    <div className="w-full min-h-screen theme-bg space-y-4">
      <h1 className="text-xl font-bold text-primary capitalize px-4 pt-4 border-b theme-border pb-2">
         {slug.replace(/-/g, " ")} - {tab}
      </h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-xl" />}>
        <GameWidget 
          leagueId={leagueId} 
          sport="football" 
          leagueSlug={slug}
          initialTab={tab} 
        />
      </Suspense>
    </div>
  );
}