import { ReactNode } from "react";
import type { Metadata } from "next";
import { resolveLeagueSeo } from "@/lib/seo/seo-resolver";

type Props = {
  children: ReactNode;
  params: Promise<{
    slug: string; // e.g. "bundesliga"
    tab: string;  // e.g. "results"
  }>;
};

// 1. GENERATE METADATA (Server Side)
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  
  // ✅ FIX: Pass 'params.tab' to the resolver
  const { metadata } = await resolveLeagueSeo("football", params.slug, params.tab);
  
  return metadata;
}

// 2. LAYOUT COMPONENT (Required to prevent Runtime Error)
export default function LeagueTabLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}