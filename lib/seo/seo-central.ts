// lib/seo/seo-central.ts

/** Single SEO entry for a page/route */
export type SeoEntry = {
  title: string;
  description: string;
  h1: string;

  primaryKeyword?: string;
  keywords?: string[];

  ogImage?: string;     // "/og.png" or full URL
  canonical?: string;   // "/match/football/123"
  jsonLd?: Record<string, any>;

  internalLinks?: { label: string; href: string }[];
};

/** ✅ used by lib/seo/api-sports.ts and other SEO modules */
export type SportKey =
  | "football"
  | "basketball"
  | "baseball"
  | "hockey"
  | "nfl"
  | "rugby"
  | "volleyball";

/** Brand (site-wide SEO) */
export const SEO_BRAND = {
  siteName: "LiveSocceRR",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://livesoccerr.com",
  tagline: "Soccer Scores. Right Now.",
  logoTitle: "LiveSocceRR Scores",
  defaultOgImage: "/og.png",
  locale: "en_US",
} as const;

/** handy aliases (prevents future missing-export errors) */
export type SeoBrand = typeof SEO_BRAND;
export type SeoOverrideMap = Record<string, Partial<SeoEntry>>;

/**
 * ✅ Admin panel later:
 * Put DB values into this shape.
 * Keep keys same => no need to touch routes/pages later.
 */
export const SEO_ADMIN_OVERRIDES: SeoOverrideMap = {
  // "page:contact": { title: "...", description: "...", h1: "..." },
  // "sports:football:live": { title: "...", description: "...", h1: "..." },
  // "match:football:123456": { title: "...", description: "...", ogImage: "/og/custom.png" },
  // "match:football:123456:lineups": { title: "... lineups ..." },
};

export const SPORT_LABELS: Record<string, string> = {
  football: "Football",
  soccer: "Football",
  basketball: "Basketball",
  nfl: "NFL",
  "american-football": "NFL",
  hockey: "Hockey",
  "ice-hockey": "Hockey",
  baseball: "Baseball",
  rugby: "Rugby",
  volleyball: "Volleyball",
};

export const SPORTS_TAB_LABELS: Record<string, string> = {
  all: "Today",
  today: "Today",
  live: "Live Now",
  finished: "Final Scores",
  scheduled: "Upcoming Fixtures",
};

export const MATCH_TAB_LABELS: Record<string, string> = {
  summary: "Score, Lineups & Stats",
  stats: "Stats",
  statistics: "Stats",
  lineups: "Lineups",
  h2h: "Head-to-Head",
  standings: "Standings",
  odds: "Odds",
  results: "Result",
  fixtures: "Fixture",
};

/** ✅ Landing / Home */
export const SEO_HOME: SeoEntry = {
  title:
    "Live Soccer & All Sports Scores | Football, Basketball, NFL, Hockey – LiveSoccerR",
  description:
    "Get live scores, results, fixtures, and updates for football, basketball, NFL, baseball, hockey, rugby, volleyball, and more. Follow your favorite teams in real-time at LiveSoccerR.com!",
  h1: "Live Scores for Football, Basketball, NFL, Hockey, Rugby, Volleyball & More",
  primaryKeyword: "live soccer scores",
  keywords: [
    "live scores",
    "soccer scores",
    "football live scores",
    "basketball live scores",
    "nfl live scores",
    "hockey live scores",
    "baseball live scores",
    "rugby live scores",
    "volleyball live scores",
  ],
};

/** ✅ Static pages */
export const SEO_PAGES: Record<"contact" | "privacyPolicy", SeoEntry> = {
  contact: {
    title: "Contact LiveSoccerR | Support & Feedback",
    description:
      "Contact LiveSoccerR for support, feedback or partnerships. We respond fast and keep scores accurate.",
    h1: "Contact LiveSoccerR",
    primaryKeyword: "contact livesoccerr",
  },
  privacyPolicy: {
    title: "Privacy Policy | LiveSoccerR",
    description:
      "Read LiveSoccerR’s privacy policy to understand how we handle cookies, analytics and privacy across our live score pages.",
    h1: "Privacy Policy",
    primaryKeyword: "privacy policy livesoccerr",
  },
};

/** ✅ Match templates (dynamic team names filled at runtime) */
export const SEO_MATCH = {
  revalidateSeconds: 60,
  apiTimeoutMs: 650,

  primaryKeyword: "live score",

  titlePatterns: [
    "MATCH: {home} vs {away} – Score, Lineups & Stats",
    "MATCH: {home} vs {away} – Score & Lineups",
    "{home} vs {away} Live Score",
  ] as const,

  descriptionPattern:
    "Watch live score updates of {home} vs {away} with goals, lineups, news & match timeline. Fast updates on {brand}.",

  h1Pattern: "MATCH: {home} vs {away} – Live Score",

  og: {
    useDynamicBanner: true,
    bannerPath: "/og/match/{sport}/{id}",
    fallbackImage: "/og.png",
  },

  schema: { enabled: true },
} as const;

/**
 * ✅ This is what lib/seo/seo-store.ts expects:
 * export { SEO_STORE_DEFAULT, SeoStore } from "./seo-central"
 */
export type SeoStore = {
  brand: SeoBrand;
  home: SeoEntry;
  pages: Record<string, SeoEntry>;
  overrides: SeoOverrideMap;

  labels: {
    sportLabels: Record<string, string>;
    sportsTabLabels: Record<string, string>;
    matchTabLabels: Record<string, string>;
  };

  match: typeof SEO_MATCH;
};

export const SEO_STORE_DEFAULT: SeoStore = {
  brand: SEO_BRAND,
  home: SEO_HOME,
  pages: SEO_PAGES,
  overrides: SEO_ADMIN_OVERRIDES,
  labels: {
    sportLabels: SPORT_LABELS,
    sportsTabLabels: SPORTS_TAB_LABELS,
    matchTabLabels: MATCH_TAB_LABELS,
  },
  match: SEO_MATCH,
};

/** ✅ Legacy export (if anything still imports SEO_CONTENT) */
export const SEO_CONTENT = {
  global: SEO_BRAND,
  home: {
    metadata: { title: SEO_HOME.title, description: SEO_HOME.description },
    headings: { h1: SEO_HOME.h1 },
  },
} as const;
