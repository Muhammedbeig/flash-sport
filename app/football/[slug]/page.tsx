import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FOOTBALL_ROUTES } from "@/lib/seo-routes"; // <--- MUST MATCH FILE ABOVE
import GameWidget from "@/components/widgets/GameWidget";
import { Skeleton } from "@/components/ui/Skeleton";

// 1. Generate Static Params (Required for GitHub Pages)
export function generateStaticParams() {
  const leagueSlugs = Object.keys(FOOTBALL_ROUTES.leagues).map((slug) => ({
    slug,
  }));

  const pageSlugs = Object.keys(FOOTBALL_ROUTES.pages).map((slug) => ({
    slug,
  }));

  return [...leagueSlugs, ...pageSlugs];
}

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function FootballSeoPage({ params }: Props) {
  const { slug } = await params;

  // Case A: It's a League
  if (slug in FOOTBALL_ROUTES.leagues) {
    // @ts-ignore
    const leagueId = FOOTBALL_ROUTES.leagues[slug];
    return (
      <div className="w-full min-h-screen theme-bg space-y-4">
        <h1 className="text-xl font-bold text-primary capitalize px-4 pt-4 border-b theme-border pb-2">
           {slug.replace(/-/g, " ")}
        </h1>
        <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-xl" />}>
          <GameWidget 
            leagueId={leagueId} 
            sport="football" 
            leagueSlug={slug}
            initialTab="summary" 
          />
        </Suspense>
      </div>
    );
  }

  // Case B: It's a Page
  if (slug in FOOTBALL_ROUTES.pages) {
    return (
      <div className="w-full min-h-screen theme-bg space-y-4">
        <h1 className="text-xl font-bold text-primary capitalize px-4 pt-4 border-b theme-border pb-2">
          Football {slug}
        </h1>
        <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-xl" />}>
          <GameWidget sport="football" />
        </Suspense>
      </div>
    );
  }

  return notFound();
}