// app/sitemap.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";
import { buildSitemap } from "@/lib/sitemap";
import { getSeoStore } from "@/lib/seo/seo-store";

export const runtime = "nodejs";
export const revalidate = 300; // refresh sitemap every 5 min

function normalizeBaseUrl(v: string) {
  return (v || "").replace(/\/+$/, "") || "http://localhost:3000";
}

function ensurePath(p: string) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function withSlashPath(p: string) {
  if (!p) return "/";
  if (p === "/") return "/";
  return p.endsWith("/") ? p : `${p}/`;
}

function toAbsolute(baseUrl: string, pathOrUrl: string) {
  if (!pathOrUrl) return `${baseUrl}/`;

  // absolute URL -> keep same pathname but force to our domain
  if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const u = new URL(pathOrUrl);
      const fixedPath = withSlashPath(u.pathname);
      return `${baseUrl}${fixedPath}${u.search}${u.hash}`;
    } catch {
      // fallback: treat as path
      const p = withSlashPath(ensurePath(pathOrUrl));
      return `${baseUrl}${p}`;
    }
  }

  const p = withSlashPath(ensurePath(pathOrUrl));
  return `${baseUrl}${p}`;
}

function clampPriority(n: any, fallback: number) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(1, v));
}

function dedupe(items: MetadataRoute.Sitemap) {
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];
  for (const it of items) {
    if (!it?.url) continue;
    if (seen.has(it.url)) continue;
    seen.add(it.url);
    out.push(it);
  }
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL (prefer Global SEO store brand.siteUrl)
  let baseUrl = "";
  try {
    const store: any = await getSeoStore();
    baseUrl =
      store?.brand?.siteUrl ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.SITE_URL ||
      "";
  } catch {
    baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.SITE_URL ||
      "";
  }
  baseUrl = normalizeBaseUrl(baseUrl);

  const now = new Date();

  // Sitemap priorities from admin
  const settings =
    (await prisma.sitemapSettings.findFirst()) || {
      homePriority: 1.0,
      postPriority: 0.9,
      pagePriority: 0.8,
    };

  const homePriority = clampPriority((settings as any).homePriority, 1.0);
  const pagePriority = clampPriority((settings as any).pagePriority, 0.8);
  const postPriority = clampPriority((settings as any).postPriority, 0.9);

  // 1) Existing sports/league/match entries (your lib/sitemap.ts)
  const raw = await buildSitemap(baseUrl);

  const entries: MetadataRoute.Sitemap = raw.map((x) => ({
    ...x,
    url: toAbsolute(baseUrl, x.url),
  }));

  // Ensure home has admin priority (optional override)
  entries.push({
    url: toAbsolute(baseUrl, "/"),
    lastModified: now,
    changeFrequency: "hourly",
    priority: homePriority,
  });

  /* ---------------------------------------------------------------------- */
  /* BLOG                                                                    */
  /* ---------------------------------------------------------------------- */

  // Blog home
  entries.push({
    url: toAbsolute(baseUrl, "/blog"),
    lastModified: now,
    changeFrequency: "weekly",
    priority: pagePriority,
  });

  // Blog categories + tags (NOTE: your BlogCategory/BlogTag do NOT have updatedAt)
  const [blogCats, blogTags, blogPosts] = await Promise.all([
    prisma.blogCategory.findMany({
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.blogTag.findMany({
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.blogPost.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }], // exclude scheduled
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        category: { select: { slug: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 10000,
    }),
  ]);

  for (const c of blogCats) {
    if (!c?.slug) continue;
    entries.push({
      url: toAbsolute(baseUrl, `/blog/${c.slug}`),
      lastModified: now, // category model has no updatedAt -> use now
      changeFrequency: "weekly",
      priority: pagePriority,
    });
  }

  for (const t of blogTags) {
    if (!t?.slug) continue;
    entries.push({
      url: toAbsolute(baseUrl, `/blog/tag/${t.slug}`),
      lastModified: now, // tag model has no updatedAt -> use now
      changeFrequency: "weekly",
      priority: pagePriority,
    });
  }

  for (const p of blogPosts) {
    if (!p?.slug) continue;
    const catSlug = p.category?.slug || "uncategorized";
    entries.push({
      url: toAbsolute(baseUrl, `/blog/${catSlug}/${p.slug}`),
      lastModified: p.publishedAt ?? p.updatedAt ?? now,
      changeFrequency: "monthly",
      priority: postPriority,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* FAQS                                                                    */
  /* ---------------------------------------------------------------------- */

  // FAQs home
  entries.push({
    url: toAbsolute(baseUrl, "/faqs"),
    lastModified: now,
    changeFrequency: "monthly",
    priority: pagePriority,
  });

  // NOTE: FAQCategory does NOT have updatedAt in your code usage; FAQ does have updatedAt.
  const [faqCats, faqs] = await Promise.all([
    prisma.fAQCategory.findMany({
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.fAQ.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
      orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
      take: 20000,
    }),
  ]);

  for (const c of faqCats) {
    if (!c?.slug) continue;
    entries.push({
      url: toAbsolute(baseUrl, `/faqs/${c.slug}`),
      lastModified: now, // category has no updatedAt
      changeFrequency: "weekly",
      priority: pagePriority,
    });
  }

  for (const f of faqs) {
    if (!f?.slug) continue;
    const catSlug = f.category?.slug || "uncategorized";
    entries.push({
      url: toAbsolute(baseUrl, `/faqs/${catSlug}/${f.slug}`),
      lastModified: f.updatedAt ?? now,
      changeFrequency: "monthly",
      priority: postPriority,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* CUSTOM PAGES (admin "Web Pages")                                        */
  /* ---------------------------------------------------------------------- */

  // avoid clashes with real app routes
  const RESERVED = new Set([
    "admin",
    "api",
    "blog",
    "faqs",
    "contact",
    "privacy-policy",
    "terms-of-service",
    "sports",
    "match",
    "player",
    "football",
    "robots.txt",
    "sitemap.xml",
    "sitemap",
  ]);

  const customPages = await prisma.page.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50000,
  });

  for (const p of customPages) {
    const slug = String(p.slug || "").trim();
    if (!slug || RESERVED.has(slug)) continue;

    entries.push({
      url: toAbsolute(baseUrl, `/${slug}`),
      lastModified: p.updatedAt ?? now,
      changeFrequency: "monthly",
      priority: pagePriority,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* ADMIN CUSTOM SITEMAP LINKS (manual)                                     */
  /* ---------------------------------------------------------------------- */

  const links = await prisma.sitemapLink.findMany({ orderBy: { updatedAt: "desc" } });
  for (const l of links) {
    const path = String((l as any).path || "").trim();
    if (!path) continue;

    entries.push({
      url: toAbsolute(baseUrl, path),
      lastModified: (l as any).updatedAt ?? now,
      changeFrequency: ((l as any).frequency as any) || "weekly",
      priority: clampPriority((l as any).priority, 0.7),
    });
  }

  return dedupe(entries);
}
