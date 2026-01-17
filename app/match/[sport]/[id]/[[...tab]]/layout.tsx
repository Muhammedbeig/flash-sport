import type { Metadata } from "next";
import { resolveMatchSeo } from "@/lib/seo/seo-resolver";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; id: string; tab?: string[] }>;
}): Promise<Metadata> {
  const { sport, id, tab } = await params;
  const activeTab = tab?.[0] || "summary";
  const { metadata } = await resolveMatchSeo(sport, id, activeTab);
  return metadata;
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ sport: string; id: string; tab?: string[] }>;
}) {
  const { sport, id, tab } = await params;
  const activeTab = tab?.[0] || "summary";
  const { entry } = await resolveMatchSeo(sport, id, activeTab);

  return (
    <>
      <h1 className="sr-only">{entry.h1}</h1>

      {entry.jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry.jsonLd) }}
        />
      ) : null}

      {children}
    </>
  );
}
