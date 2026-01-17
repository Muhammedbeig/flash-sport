// lib/seo/seo-central.ts

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

/** Robots meta for a page */
export type SeoRobots = {
  index?: boolean; // true => index
  follow?: boolean; // true => follow
};

/** Breadcrumb item */
export type SeoBreadcrumb = {
  name: string;
  url: string;
};

/** Image alt mapping */
export type SeoImageAlt = {
  src: string;
  alt: string;
};

/** Single SEO entry for a page/route */
export type SeoEntry = {
  // REQUIRED
  title: string;
  description: string;
  h1: string;

  // OPTIONAL
  primaryKeyword?: string;
  keywords?: string[];

  canonical?: string; // e.g. "/match/football/123/"
  jsonLd?: Record<string, any>;

  internalLinks?: { label: string; href: string }[];

  // Open Graph Overrides
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string; // e.g. "/og.png" or full URL

  robots?: SeoRobots;
  breadcrumbs?: SeoBreadcrumb[];
  imageAlts?: SeoImageAlt[];

  headerScripts?: string;
  footerScripts?: string;
};

/** Sport Keys used in the app */
export type SportKey =
  | "football"
  | "basketball"
  | "baseball"
  | "hockey"
  | "nfl"
  | "rugby"
  | "volleyball";

/* -------------------------------------------------------------------------- */
/* DEFAULTS                                                                   */
/* -------------------------------------------------------------------------- */

// ✅ HELPER: Determine Base URL Dynamically
const getBaseUrl = () => {
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://livesoccerr.com";
};

// ✅ EXPORTED: Brand (matches JSON store shape)
export const SEO_BRAND = {
  siteName: "Live Score",
  siteUrl: getBaseUrl(),
  siteDomain: "livesoccerr.com",
  tagline: "Soccer Scores. Right Now.",
  logoTitle: "LiveSocceRR Scores",
  // optional override for header/footer; safe default:
  logoUrl: "/brand/logo.svg",

  titlePrefix: "",
  titleSuffix: "",

  defaultOgImage: "/og.png",
  defaultMetaDescription:
    "Live scores, results, fixtures and stats across football, basketball, NFL, hockey, rugby, volleyball and more.",
  locale: "en_US",
};

// ✅ EXPORTED: Home
export const SEO_HOME: SeoEntry = {
  title: `Live Soccer & All Sports Scores | Football, Basketball, NFL, Hockey – ${SEO_BRAND.siteName}`,
  description: `Get live scores, results, fixtures, and updates for football, basketball, NFL, baseball, hockey, rugby, volleyball, and more. Follow your favorite teams in real-time at ${SEO_BRAND.siteName}!`,
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
  canonical: "/",
};

// ✅ EXPORTED: Match templates
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
};

// ✅ EXPORTED: Player templates
export const SEO_PLAYER = {
  revalidateSeconds: 3600,
  apiTimeoutMs: 1500,
  primaryKeyword: "player profile",
  titlePatterns: [
    "{name} ({team}) – Profile, Stats & News",
    "{name} Stats – {team} Player Profile",
    "{name} – Career Stats & Goals",
  ] as const,
  descriptionPattern:
    "{name} plays for {team}. View complete player profile, stats, goals, match history and market value on {brand}.",
  h1Pattern: "{name} – Player Profile",
  og: {
    fallbackImage: "/og.png",
  },
  schema: { enabled: true },
};

// ✅ EXPORTED: League templates
export const SEO_LEAGUE = {
  revalidateSeconds: 86400, // 24 hours
  apiTimeoutMs: 2000,
  primaryKeyword: "league table",
  titlePatterns: [
    "{name} ({country}) – Live Scores, Standings & Fixtures",
    "{name} {season} Table & Results – {brand}",
  ] as const,
  descriptionPattern:
    "Follow {name} ({season}) live scores, results, fixtures, and standings. Get real-time updates for {name} in {country} on {brand}.",
  h1Pattern: "{name} – Live Scores & Standings",
  og: {
    fallbackImage: "/og.png",
  },
  schema: { enabled: true },
};

/* -------------------------------------------------------------------------- */
/* OPTIONAL GLOBAL SECTIONS (driven by seo-store.global.json)                 */
/* -------------------------------------------------------------------------- */

export type GlobalHeaderNav = {
  desktopVisibleCount?: number;
  mobileTop?: string[];
  allSports?: Array<{ id: string; icon: string }>;
};

export type GlobalHeader = {
  nav?: GlobalHeaderNav;
};

export type GlobalFooter = {
  aboutText?: string;
  appLinks?: { googlePlay?: string; appStore?: string };
  socials?: { twitter?: string; facebook?: string; instagram?: string; youtube?: string };
};

export type GlobalDefaults = {
  robots?: string; // e.g. "index, follow"
  keywords?: string[];
  og?: { type?: string; fallbackImage?: string; imageAlt?: string };
  twitter?: { card?: string; fallbackImage?: string };
};

export type AutoSettings = {
  autoTitlePattern?: string;
  autoDescriptionPattern?: string;
  autoSchema?: boolean;
};

/* -------------------------------------------------------------------------- */
/* STORE TYPE                                                                 */
/* -------------------------------------------------------------------------- */

export type SeoBrand = typeof SEO_BRAND;
export type SeoOverrideMap = Record<string, Partial<SeoEntry>>;

export type SeoStore = {
  brand: SeoBrand;
  home: SeoEntry;

  // Static pages
  pages: Record<string, SeoEntry>;
  overrides: SeoOverrideMap;

  labels: {
    sportLabels: Record<string, string>;
    sportsTabLabels: Record<string, string>;
    matchTabLabels: Record<string, string>;
  };

  match: typeof SEO_MATCH;
  player: typeof SEO_PLAYER;
  league: typeof SEO_LEAGUE;

  // ✅ optional global config for Header/Footer + defaults
  header?: GlobalHeader;
  footer?: GlobalFooter;
  defaults?: GlobalDefaults;
  auto?: AutoSettings;
};

/* -------------------------------------------------------------------------- */
/* DEFAULT STORE                                                              */
/* -------------------------------------------------------------------------- */

const DEFAULT_PRIVACY: SeoEntry = {
  title: `Privacy Policy | ${SEO_BRAND.siteName}`,
  description: `Privacy Policy for ${SEO_BRAND.siteName}. Learn how we handle your data.`,
  h1: "Privacy Policy",
};

const DEFAULT_TERMS: SeoEntry = {
  title: `Terms of Service | ${SEO_BRAND.siteName}`,
  description: `Terms and conditions for using ${SEO_BRAND.siteName}.`,
  h1: "Terms of Service",
};

const DEFAULT_CONTACT: SeoEntry = {
  title: `Contact Us | ${SEO_BRAND.siteName}`,
  description: `Contact the ${SEO_BRAND.siteName} team for support or inquiries.`,
  h1: "Contact Us",
};

// ✅ EXPORTED
export const SEO_STORE_DEFAULT: SeoStore = {
  brand: SEO_BRAND,
  home: SEO_HOME,

  // ✅ include BOTH camel keys (used by json injection + resolver)
  // ✅ and dashed aliases (for backward compatibility)
  pages: {
    privacyPolicy: DEFAULT_PRIVACY,
    termsOfService: DEFAULT_TERMS,
    contact: DEFAULT_CONTACT,

    "privacy-policy": DEFAULT_PRIVACY,
    "terms-of-service": DEFAULT_TERMS,
  },

  overrides: {},

  labels: {
    sportLabels: {
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
    },
    sportsTabLabels: {
      all: "Today",
      today: "Today",
      live: "Live Now",
      finished: "Final Scores",
      scheduled: "Upcoming Fixtures",
    },
    matchTabLabels: {
      summary: "Score, Lineups & Stats",
      stats: "Stats",
      statistics: "Stats",
      lineups: "Lineups",
      h2h: "Head-to-Head",
      standings: "Standings",
      odds: "Odds",
      results: "Result",
      fixtures: "Fixture",
    },
  },

  match: SEO_MATCH,
  player: SEO_PLAYER,
  league: SEO_LEAGUE,

  // ✅ safe defaults used by seo-resolver.ts (no design impact)
  defaults: {
    robots: "index, follow",
    og: {
      type: "website",
      fallbackImage: "/og.png",
      imageAlt: "Live Scores for Football, Basketball, NFL, Hockey, Rugby, Volleyball & More",
    },
    twitter: {
      card: "summary_large_image",
      fallbackImage: "/og.png",
    },
  },

  // optional; admin can override via global json
  header: {
    nav: {
      desktopVisibleCount: 6,
      mobileTop: ["football", "basketball", "nfl"],
      allSports: [
        { id: "football", icon: "⚽" },
        { id: "basketball", icon: "🏀" },
        { id: "nfl", icon: "🏈" },
        { id: "baseball", icon: "⚾" },
        { id: "hockey", icon: "🏒" },
        { id: "rugby", icon: "🏉" },
        { id: "volleyball", icon: "🏐" },
      ],
    },
  },

  footer: {
    aboutText:
      "LiveSocceRR delivers fast live scores, results, fixtures and stats across football, basketball, NFL, hockey, rugby, volleyball and more.",
    appLinks: {},
    socials: {},
  },

  auto: {
    autoSchema: true,
  },
};

export const SEO_CONTENT = SEO_STORE_DEFAULT;
