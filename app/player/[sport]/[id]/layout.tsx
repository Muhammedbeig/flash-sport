import type { Metadata } from "next";
import { resolvePlayerSeo } from "@/lib/seo/seo-resolver";

type PlayerParams = { sport: string; id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PlayerParams>;
}): Promise<Metadata> {
  const { sport, id } = await params;
  const seo = await resolvePlayerSeo(sport, id);
  return seo.metadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
