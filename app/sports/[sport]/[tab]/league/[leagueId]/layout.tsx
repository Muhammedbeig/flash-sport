import type { Metadata } from "next";
import { resolveSportsLeagueSeo } from "@/lib/seo/seo-resolver";

export async function generateMetadata({
  params,
}: {
  params: { sport: string; tab: string; leagueId: string };
}): Promise<Metadata> {
  const seo = await resolveSportsLeagueSeo({
    sport: params.sport,
    tab: params.tab,
    leagueId: params.leagueId,
    pathname: `/sports/${params.sport}/${params.tab}/league/${params.leagueId}`,
  });
  return seo.metadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
