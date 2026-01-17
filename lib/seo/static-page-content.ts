// lib/seo/static-page-content.ts
import "server-only";

import path from "node:path";
import { promises as fs } from "node:fs";
import { unstable_noStore as noStore } from "next/cache";

export type StaticPageSlug = "privacy-policy" | "terms-of-service" | "contact";

export type Inline =
  | { type: "text"; value: string }
  | { type: "link"; href: string; label: string };

export type LegalBlock =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "p_rich"; inlines: Inline[] };

export type LegalSection = { title: string; blocks: LegalBlock[] };

export type LegalDoc = {
  h1: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export type ContactDoc = {
  h1: string;
  lastUpdated?: string;
  intro?: string[];

  // supports both formats in your json
  contactDetails?: {
    supportEmail?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    address?: string[];
    addressLine1?: string;
    addressLine2?: string;
    supportHours?: string;
  };

  supportEmail?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  addressLine1?: string;
  addressLine2?: string;
  supportHours?: string;

  cardTitle?: string;
  cardSubtitle?: string;
  note?: string;

  sections?: Array<{ title: string; blocks: LegalBlock[] }>;
};

type SeoPageJson<TContent> = {
  schemaVersion?: number | string;
  updatedAt?: string;
  slug?: StaticPageSlug;
  seo?: unknown;
  content: TContent;
};

function storeDir() {
  // ✅ your folder name is "seo-config"
  return (process.env.SEO_STORE_DIR || path.join(process.cwd(), "seo-config")).trim();
}

function candidatePathsFor(slug: StaticPageSlug) {
  const filename = `seo-page.${slug}.json`;
  const dir = storeDir();

  return [
    // ✅ primary: /seo-config (or SEO_STORE_DIR)
    path.join(dir, filename),

    // optional fallbacks (won't hurt)
    path.join(process.cwd(), "seo", filename),
    path.join(process.cwd(), filename),
    path.join(process.cwd(), "data", "seo", filename),
    path.join(process.cwd(), "data", filename),
  ];
}

async function readFirstExistingJson<T>(pathsToTry: string[]): Promise<T | null> {
  for (const p of pathsToTry) {
    try {
      const raw = await fs.readFile(p, "utf8");
      const parsed = JSON.parse(raw) as T;
      return parsed;
    } catch {
      // try next path
    }
  }
  return null;
}

function fallbackContent(slug: StaticPageSlug) {
  const today = new Date().toISOString().slice(0, 10);

  if (slug === "privacy-policy") {
    const content: LegalDoc = {
      h1: "Privacy Policy",
      lastUpdated: today,
      sections: [
        {
          title: "Introduction",
          blocks: [
            {
              type: "p",
              text:
                "Privacy content JSON not found. Please place seo-page.privacy-policy.json in /seo-config (or set SEO_STORE_DIR).",
            },
          ],
        },
      ],
    };
    return { content };
  }

  if (slug === "terms-of-service") {
    const content: LegalDoc = {
      h1: "Terms of Service",
      lastUpdated: today,
      sections: [
        {
          title: "Introduction",
          blocks: [
            {
              type: "p",
              text:
                "Terms content JSON not found. Please place seo-page.terms-of-service.json in /seo-config (or set SEO_STORE_DIR).",
            },
          ],
        },
      ],
    };
    return { content };
  }

  const content: ContactDoc = {
    h1: "Contact",
    intro: [
      "Contact content JSON not found. Please place seo-page.contact.json in /seo-config (or set SEO_STORE_DIR).",
    ],
    contactDetails: { email: "service@livesoccerr.com" },
    cardTitle: "Email Support",
    cardSubtitle: "Send us an email and we’ll respond as soon as possible.",
    note: "For urgent matters, include as many details as possible in your email.",
  };
  return { content };
}

/* -------------------------------------------------------------------------- */
/* ✅ DB <-> FILE BRIDGE (THE REAL FIX)                                       */
/* -------------------------------------------------------------------------- */

function extractSeoPageJsonFromDb(data: any): SeoPageJson<any> | null {
  if (!data || typeof data !== "object") return null;

  // Most common: data is already { seo, content, slug, updatedAt }
  if (data.content && typeof data.content === "object") return data as SeoPageJson<any>;

  // Some code stores { data: { seo, content } }
  if (data.data?.content && typeof data.data.content === "object") return data.data as SeoPageJson<any>;

  // Some code stores { page: { seo, content } } / { payload: ... } etc
  const candidates = [data.page, data.payload, data.value];
  for (const c of candidates) {
    if (c?.content && typeof c.content === "object") return c as SeoPageJson<any>;
  }

  return null;
}

function countSections(doc: SeoPageJson<any> | null | undefined): number {
  const secs = doc?.content?.sections;
  return Array.isArray(secs) ? secs.length : 0;
}

async function readFromDb(slug: StaticPageSlug): Promise<SeoPageJson<any> | null> {
  try {
    const mod = await import("@/lib/db/prisma");
    const prisma = (mod as any).prisma;
    if (!prisma) return null;

    const row = await prisma.seoPage.findUnique({
      where: { slug },
      select: { data: true, updatedAt: true },
    });

    const parsed = extractSeoPageJsonFromDb(row?.data);
    if (!parsed?.content) return null;

    // ensure slug + updatedAt reflect DB
    return {
      ...parsed,
      slug,
      updatedAt: row?.updatedAt?.toISOString?.() || parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

async function upsertDb(slug: StaticPageSlug, data: SeoPageJson<any>) {
  try {
    const mod = await import("@/lib/db/prisma");
    const prisma = (mod as any).prisma;
    if (!prisma) return;

    await prisma.seoPage.upsert({
      where: { slug },
      create: { slug, data },
      update: { data },
    });
  } catch {
    // best-effort only
  }
}

/**
 * Heuristic:
 * - If DB has only 1 section (seeded template) but file has many sections,
 *   prefer file and seed DB from file so Admin shows all sections too.
 */
function shouldPreferFileOverDb(slug: StaticPageSlug, dbDoc: SeoPageJson<any>, fileDoc: SeoPageJson<any>) {
  if (slug === "privacy-policy" || slug === "terms-of-service") {
    const dbCount = countSections(dbDoc);
    const fileCount = countSections(fileDoc);

    // if DB looks like the “only introduction” seed, but file is the real full document
    if (dbCount <= 1 && fileCount >= 2) return true;
  }

  return false;
}

/* -------------------------------------------------------------------------- */
/* PUBLIC API                                                                 */
/* -------------------------------------------------------------------------- */

export async function readStaticPageContent(
  slug: "privacy-policy"
): Promise<SeoPageJson<LegalDoc>>;
export async function readStaticPageContent(
  slug: "terms-of-service"
): Promise<SeoPageJson<LegalDoc>>;
export async function readStaticPageContent(
  slug: "contact"
): Promise<SeoPageJson<ContactDoc>>;
export async function readStaticPageContent(slug: StaticPageSlug): Promise<SeoPageJson<any>> {
  // ✅ ensures admin edits reflect immediately
  noStore();

  // 1) Read from DB first (ADMIN source of truth)
  const dbDoc = await readFromDb(slug);

  // 2) Read from file store (YOUR CURRENT website source)
  const fileDoc = await readFirstExistingJson<SeoPageJson<any>>(candidatePathsFor(slug));

  // ✅ If both exist, but DB is the old “intro-only” seed, use file and seed DB.
  if (dbDoc?.content && fileDoc?.content) {
    if (shouldPreferFileOverDb(slug, dbDoc, fileDoc)) {
      // Seed DB so Admin instantly shows all sections
      await upsertDb(slug, { ...fileDoc, slug });
      return { ...fileDoc, slug };
    }
    return dbDoc;
  }

  // ✅ If DB exists -> return it (Admin changes will reflect on website)
  if (dbDoc?.content) return dbDoc;

  // ✅ If only file exists -> return it and seed DB (so admin matches website)
  if (fileDoc?.content) {
    await upsertDb(slug, { ...fileDoc, slug });
    return { ...fileDoc, slug };
  }

  // ✅ fallback
  return fallbackContent(slug) as SeoPageJson<any>;
}
