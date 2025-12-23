// app/terms-of-service/layout.tsx
import type { Metadata } from "next";
import { resolveStaticPageSeo } from "@/lib/seo/seo-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await resolveStaticPageSeo("terms-of-service", "/terms-of-service");
  return seo.metadata;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
