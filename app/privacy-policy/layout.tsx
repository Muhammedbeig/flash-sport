import type { Metadata } from "next";
import { resolveStaticPageSeo } from "@/lib/seo/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await resolveStaticPageSeo("privacy-policy", "/privacy-policy");
  return seo.metadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
