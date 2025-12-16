import type { Metadata } from "next";
import { resolveStaticPageSeo } from "@/lib/seo/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await resolveStaticPageSeo("contact", "/contact");
  return seo.metadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
