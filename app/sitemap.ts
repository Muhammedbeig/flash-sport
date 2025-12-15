import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap";

// ✅ MUST be a plain literal (no expressions like 60 * 30)
export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
