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

  const json = await readFirstExistingJson<SeoPageJson<any>>(candidatePathsFor(slug));
  if (json?.content) return json;

  return fallbackContent(slug) as SeoPageJson<any>;
}
