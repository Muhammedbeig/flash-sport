import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap";

// Re-generate sitemap periodically (auto-updates without redeploy)
export const revalidate = 60 * 30; // 30 minutes

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
