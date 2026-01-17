import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchLeagueData } from "@/lib/seo/league-seo";
import GameWidget from "@/components/widgets/GameWidget";
import { Skeleton } from "@/components/ui/Skeleton";
import { FOOTBALL_ROUTES } from "@/lib/seo-routes";

type Props = {
  params: Promise<{
    slug: string;
    tab: string;
  }>;
};

export default async function LeagueTabPage(props: Props) {
  const params = await props.params;
  const { slug, tab } = params;

  // 1. Fetch Data to get the League ID
  const data = await fetchLeagueData("football", slug);

  // 2. Validation: If no data, return 404
  if (!data || !data.id) {
    return notFound();
  }

  return (
    <div className="w-full min-h-screen theme-bg space-y-4">
       <h1 className="text-xl font-bold text-primary capitalize px-4 pt-4 border-b theme-border pb-2">
           {data.name}
        </h1>
      <Suspense fallback={<Skeleton className="w-full h-[600px] rounded-xl" />}>
        <GameWidget 
          leagueId={String(data.id)} 
          sport="football" 
          leagueSlug={slug}
          initialTab={tab} // ✅ Pass the tab to the widget
        />
      </Suspense>
    </div>
  );
}