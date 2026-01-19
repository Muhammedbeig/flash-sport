import { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS = {
  homePriority: 1.0,
  postPriority: 0.9,
  pagePriority: 0.8,
};

function buildStaticRoutes(baseUrl: string, settings: typeof DEFAULT_SETTINGS): MetadataRoute.Sitemap {
  const now = new Date();

  // Static Pages (Use pagePriority, except Home)
  return ["", "/blogs", "/about", "/contact", "/privacy", "/terms"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route === "" ? settings.homePriority : settings.pagePriority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Fetch Global Settings
  let settings = DEFAULT_SETTINGS;
  try {
    const dbSettings = await prisma.sitemapSettings.findFirst();
    if (dbSettings) settings = dbSettings;
  } catch {
    return buildStaticRoutes(baseUrl, DEFAULT_SETTINGS);
  }

  // 2. Static Pages (Use pagePriority, except Home)
  const staticRoutes = buildStaticRoutes(baseUrl, settings);

  // 3. Custom Links (Keep existing logic)
  let customRoutes: MetadataRoute.Sitemap = [];
  try {
    const customDbLinks = await prisma.sitemapLink.findMany();
    customRoutes = customDbLinks.map((link) => ({
      url: `${baseUrl}${link.path}`,
      lastModified: link.updatedAt,
      changeFrequency: link.frequency as any,
      priority: link.priority,
    }));
  } catch {
    customRoutes = [];
  }

  // 4. Blog Posts (Use postPriority)
  let postUrls: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true, deletedAt: null },
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } },
    });

    postUrls = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.category?.slug || "uncategorized"}/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: settings.postPriority,
    }));
  } catch {
    postUrls = [];
  }

  // 5. Categories (Use pagePriority)
  let categoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.blogCategory.findMany({ select: { slug: true } });
    categoryUrls = categories.map((cat) => ({
      url: `${baseUrl}/blog/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: settings.pagePriority,
    }));
  } catch {
    categoryUrls = [];
  }

  return [...staticRoutes, ...customRoutes, ...postUrls, ...categoryUrls];
}
