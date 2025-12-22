import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap";

// ✅ MUST be a plain literal
export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Get raw sitemap
  const rawSitemap = await buildSitemap();
  
  // 2. Determine base URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // 3. Replace localhost with real domain
  return rawSitemap.map((item) => ({
    ...item,
    url: item.url.replace("http://localhost:3000", baseUrl),
  }));
}