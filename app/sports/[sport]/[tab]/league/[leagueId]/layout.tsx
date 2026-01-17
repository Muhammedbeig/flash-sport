import type { Metadata } from "next";
import { resolveSportsLeagueSeo } from "@/lib/seo/seo-resolver";

type LeagueParams = { sport: string; tab: string; leagueId: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<LeagueParams>;
}): Promise<Metadata> {
  const { sport, tab, leagueId } = await params;

  const seo = await resolveSportsLeagueSeo({
    sport,
    tab,
    leagueId,
    pathname: `/sports/${sport}/${tab}/league/${leagueId}`,
  });

  return seo.metadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
