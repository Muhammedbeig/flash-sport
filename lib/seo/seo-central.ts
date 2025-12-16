// lib/seo/seo-central.ts

export type SeoEntry = {
  title: string;
  description: string;
  h1: string;

  primaryKeyword?: string;
  keywords?: string[];

  ogImage?: string;
  canonical?: string;
  jsonLd?: Record<string, any>;

  internalLinks?: { label: string; href: string }[];
};

// ✅ used by lib/seo/api-sports.ts
export type SportKey =
  | "football"
  | "basketball"
  | "baseball"
  | "hockey"
  | "nfl"
  | "rugby"
  | "volleyball";

export const SEO_BRAND = {
  siteName: "LiveSoccerR",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://livesoccerr.com",
  tagline: "Soccer Scores. Right Now.",
  logoTitle: "LiveSocceRR Scores",
  defaultOgImage: "/og.png",
  locale: "en_US",
} as const;

export const SEO_ADMIN_OVERRIDES: Record<string, Partial<SeoEntry>> = {};

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

export const SEO_HOME: SeoEntry = {
  title:
    "Live Soccer & All Sports Scores | Football, Basketball, NFL, Hockey – LiveSoccerR",
  description:
    "Get live scores, results, fixtures, and updates for football, basketball, NFL, baseball, hockey, rugby, volleyball, and more. Follow your favorite teams in real-time at LiveSoccerR.com!",
  h1: "Live Scores for Football, Basketball, NFL, Hockey, Rugby, Volleyball & More",
  primaryKeyword: "live soccer scores",
  keywords: ["live scores", "soccer scores", "football live scores"],
};

export const SEO_PAGES: Record<"contact" | "privacyPolicy", SeoEntry> = {
  contact: {
    title: "Contact LiveSoccerR | Support & Feedback",
    description:
      "Contact LiveSoccerR for support, feedback or partnerships. We respond fast and keep scores accurate.",
    h1: "Contact LiveSoccerR",
  },
  privacyPolicy: {
    title: "Privacy Policy | LiveSoccerR",
    description:
      "Read LiveSoccerR’s privacy policy to understand how we handle cookies, analytics and privacy across our live score pages.",
    h1: "Privacy Policy",
  },
};

export const SEO_MATCH = {
  revalidateSeconds: 60,
  apiTimeoutMs: 650,
  primaryKeyword: "live score",
  titlePatterns: [
    "LIVE: {home} vs {away} – Score, Lineups & Stats",
    "LIVE: {home} vs {away} – Score & Lineups",
    "{home} vs {away} Live Score",
  ] as const,
  descriptionPattern:
    "Watch live score updates of {home} vs {away} with goals, lineups, news & match timeline. Fast updates on {brand}.",
  h1Pattern: "LIVE: {home} vs {away} – Live Score",
  og: {
    useDynamicBanner: true,
    bannerPath: "/og/match/{sport}/{id}",
    fallbackImage: "/og.png",
  },
  schema: { enabled: true },
} as const;

export const SEO_CONTENT = {
  global: SEO_BRAND,
  home: {
    metadata: { title: SEO_HOME.title, description: SEO_HOME.description },
    headings: { h1: SEO_HOME.h1 },
  },
} as const;
