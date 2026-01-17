import type { Metadata } from "next";
import { resolveSportsTabSeo } from "@/lib/seo/seo-resolver";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; tab: string }>;
}): Promise<Metadata> {
  const { sport, tab } = await params;

  // ✅ resolver is async now (DB override)
  const { metadata } = await resolveSportsTabSeo(sport, tab);
  return metadata;
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sport: string; tab: string }>;
}) {
  const { sport, tab } = await params;

  // ✅ resolver is async now (DB override)
  const { entry } = await resolveSportsTabSeo(sport, tab);

  return (
    <>
      <h1 className="sr-only">{entry.h1}</h1>
      {children}
    </>
  );
}
