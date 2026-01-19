// app/robots.ts
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60;

// Next 16 type fix: rules can be Rule OR Rule[]
type RulesUnion = NonNullable<MetadataRoute.Robots["rules"]>;
type RuleItem = RulesUnion extends Array<infer U> ? U : RulesUnion;

function cleanLine(line: string) {
  return (line.split("#")[0] ?? "").trim();
}

function splitDirective(line: string): { key: string; value: string } | null {
  const idx = line.indexOf(":");
  if (idx === -1) return null;
  const key = line.slice(0, idx).trim().toLowerCase();
  const value = line.slice(idx + 1).trim();
  if (!key) return null;
  return { key, value };
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function normalizeBaseUrl(v: string) {
  return (v || "").replace(/\/+$/, "") || "http://localhost:3000";
}

function pushGroup(
  rules: RuleItem[],
  agents: string[],
  allow: string[],
  disallow: string[],
  crawlDelay?: number
) {
  const ua = uniq(agents);
  if (!ua.length) return;

  const a = uniq(allow);
  const d = uniq(disallow);

  const rule: any = { userAgent: ua.length === 1 ? ua[0] : ua };
  if (a.length) rule.allow = a.length === 1 ? a[0] : a;
  if (d.length) rule.disallow = d.length === 1 ? d[0] : d;
  if (typeof crawlDelay === "number" && Number.isFinite(crawlDelay)) rule.crawlDelay = crawlDelay;

  if (!("allow" in rule) && !("disallow" in rule) && !("crawlDelay" in rule)) {
    rule.allow = "/";
  }

  rules.push(rule as RuleItem);
}

function parseRobotsTxt(content: string, fallbackSitemap: string): MetadataRoute.Robots {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  const rules: RuleItem[] = [];
  const sitemaps: string[] = [];
  let host: string | undefined;

  let agents: string[] = [];
  let allow: string[] = [];
  let disallow: string[] = [];
  let crawlDelay: number | undefined;
  let seenDirective = false;

  for (const line of lines) {
    const d = splitDirective(line);
    if (!d) continue;

    const { key, value } = d;

    if (key === "host") {
      if (value) host = value;
      continue;
    }
    if (key === "sitemap") {
      if (value) sitemaps.push(value);
      continue;
    }

    if (key === "user-agent") {
      const agent = value || "*";
      if (agents.length && seenDirective) {
        pushGroup(rules, agents, allow, disallow, crawlDelay);
        agents = [];
        allow = [];
        disallow = [];
        crawlDelay = undefined;
        seenDirective = false;
      }
      agents.push(agent);
      continue;
    }

    if (key === "allow") {
      seenDirective = true;
      if (value) allow.push(value);
      continue;
    }
    if (key === "disallow") {
      seenDirective = true;
      if (value) disallow.push(value);
      continue;
    }
    if (key === "crawl-delay") {
      seenDirective = true;
      const num = Number(value);
      if (Number.isFinite(num)) crawlDelay = num;
      continue;
    }
  }

  if (agents.length) pushGroup(rules, agents, allow, disallow, crawlDelay);

  const sitemapFinal =
    sitemaps.length > 0 ? (sitemaps.length === 1 ? sitemaps[0] : uniq(sitemaps)) : fallbackSitemap;

  return {
    rules: (rules.length ? (rules as any) : ([{ userAgent: "*", allow: "/" }] as any)),
    sitemap: sitemapFinal,
    host,
  };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "");
  const fallbackSitemap = `${baseUrl}/sitemap.xml`;

  let content = "";
  try {
    const row = await prisma.robotsTxt.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { content: true },
    });
    content = (row?.content || "").trim();
  } catch {
    content = "";
  }

  if (!content) {
    return {
      rules: [{ userAgent: "*", allow: "/" }],
      sitemap: fallbackSitemap,
    };
  }

  return parseRobotsTxt(content, fallbackSitemap);
}
