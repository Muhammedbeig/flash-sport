"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Apple, Play, Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import { SEO_CONTENT } from "@/lib/seo/seo-central";

type FooterLink = { label: string; url: string };

const RESERVED_URLS = new Set([
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/blog",
  "/faqs",
]);

const FOOTER = {
  aboutText:
    "{siteName} delivers fast, real-time scores, fixtures, results, standings, and match stats across football, basketball, NFL, hockey, baseball, rugby, volleyball and more — all in one place.",

  appLinks: [
    { key: "googlePlay", name: "Google Play", url: "#", Icon: Play },
    { key: "appStore", name: "App Store", url: "#", Icon: Apple },
  ],

  columns: [
    {
      title: "Football",
      links: [
        { label: "Football Live Scores", url: "/sports/football/all" },
        { label: "Premier League", url: "/sports/football/all/league/39" },
        { label: "La Liga", url: "/sports/football/all/league/140" },
        { label: "Serie A", url: "/sports/football/all/league/135" },
        { label: "Bundesliga", url: "/sports/football/all/league/78" },
        { label: "Ligue 1", url: "/sports/football/all/league/61" },
      ] as FooterLink[],
    },
    {
      title: "Trending",
      links: [
        { label: "Champions League", url: "/sports/football/all/league/2" },
        { label: "Europa League", url: "/sports/football/all/league/3" },
        { label: "Copa Libertadores", url: "/sports/football/all/league/13" },
        { label: "World Cup", url: "/sports/football/all/league/1" },
        { label: "Leagues by Country", url: "/countries" },
      ] as FooterLink[],
    },
    {
      title: "Other Sports",
      links: [
        { label: "Basketball Live Scores", url: "/sports/basketball/all" },
        { label: "NFL Live Scores", url: "/sports/nfl/all" },
        { label: "Hockey Live Scores", url: "/sports/hockey/all" },
        { label: "Baseball Live Scores", url: "/sports/baseball/all" },
        { label: "Rugby Live Scores", url: "/sports/rugby/all" },
        { label: "Volleyball Live Scores", url: "/sports/volleyball/all" },
      ] as FooterLink[],
    },
    {
      title: "Company",
      links: [
        { label: "Contact", url: "/contact" },
        { label: "Blog", url: "/blog" },
        { label: "FAQs", url: "/faqs" },
        { label: "Privacy Policy", url: "/privacy-policy" },
        { label: "Terms of Service", url: "/terms-of-service" },
      ] as FooterLink[],
    },
  ],

  socials: [
    { key: "twitter", Icon: Twitter, label: "Twitter", href: "#" },
    { key: "facebook", Icon: Facebook, label: "Facebook", href: "#" },
    { key: "instagram", Icon: Instagram, label: "Instagram", href: "#" },
    { key: "youtube", Icon: Youtube, label: "YouTube", href: "#" },
  ],
};

function normalizeUrl(u: string) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return s.startsWith("/") ? s : `/${s}`;
}

function dedupeByUrl(items: FooterLink[]) {
  const seen = new Set<string>();
  const out: FooterLink[] = [];
  for (const it of items) {
    const url = normalizeUrl(it?.url || "");
    const label = String(it?.label || "").trim();
    if (!url || !label) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ label, url });
  }
  return out;
}

function SmartExternalLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const isPlaceholder = !href || href === "#";
  return (
    <a
      href={href || "#"}
      aria-label={ariaLabel}
      target={isPlaceholder ? undefined : "_blank"}
      rel={isPlaceholder ? undefined : "noopener noreferrer"}
      className={`${className ?? ""} ${isPlaceholder ? "pointer-events-none opacity-60" : ""}`}
    >
      {children}
    </a>
  );
}

type PublicFooterConfig = {
  aboutText?: string;
  appLinks?: { googlePlay?: string; appStore?: string };
  socials?: { twitter?: string; facebook?: string; instagram?: string; youtube?: string };
};

type SeoBrandPublic = {
  siteName?: string;
  logoTitle?: string;
  logoUrl?: string;
  tagline?: string;
  footer?: PublicFooterConfig;
};

type CompanyPagesResponseA = {
  ok?: boolean;
  pages?: Array<{ label?: string; url?: string }>;
};

type CompanyPagesResponseB = {
  ok?: boolean;
  pages?: Array<{ title?: string; slug?: string }>;
};

function parseCompanyPages(json: unknown): FooterLink[] {
  const j = json as any;
  const pages = Array.isArray(j?.pages) ? j.pages : [];

  // accept either: {label,url} OR {title,slug}
  const mapped: FooterLink[] = pages
    .map((p: any) => {
      const label = String(p?.label || p?.title || "").trim();
      const url = p?.url ? String(p.url) : p?.slug ? `/${String(p.slug)}` : "";
      return { label, url: normalizeUrl(url) };
    })
    .filter((x: FooterLink) => x.label && x.url);

  // exclude reserved static routes (avoid duplicates/noise)
  const filtered = mapped.filter((x) => !RESERVED_URLS.has(x.url));

  // sort a bit nicer
  filtered.sort((a, b) => a.label.localeCompare(b.label));

  return dedupeByUrl(filtered);
}

export default function Footer() {
  const fallbackBrand = SEO_CONTENT?.brand || {
    siteName: "LiveSocceRR",
    logoTitle: "LiveSocceRR Scores",
    tagline: "Soccer Scores. Right Now.",
  };

  const baseCompanyLinks = useMemo(() => {
    const col = FOOTER.columns.find((c) => c.title === "Company");
    return (col?.links || []) as FooterLink[];
  }, []);

  const [siteName, setSiteName] = useState<string>(fallbackBrand.siteName);
  const [logoTitle, setLogoTitle] = useState<string>(fallbackBrand.logoTitle || fallbackBrand.siteName);
  const [tagline, setTagline] = useState<string>(fallbackBrand.tagline || "");
  const [logoUrl, setLogoUrl] = useState<string>("/brand/logo.svg");

  const [footerAboutText, setFooterAboutText] = useState<string>(FOOTER.aboutText);
  const [footerAppLinks, setFooterAppLinks] = useState<PublicFooterConfig["appLinks"]>({});
  const [footerSocials, setFooterSocials] = useState<PublicFooterConfig["socials"]>({});

  // dynamic custom pages that admin creates
  const [extraCompanyLinks, setExtraCompanyLinks] = useState<FooterLink[]>([]);

  const companyLinks = useMemo(() => {
    // base first, then custom pages, de-duped by url
    return dedupeByUrl([...baseCompanyLinks, ...extraCompanyLinks]);
  }, [baseCompanyLinks, extraCompanyLinks]);

  useEffect(() => {
    const ac = new AbortController();
    let alive = true;

    (async () => {
      try {
        // 1) brand
        const brandRes = await fetch("/api/public/seo-brand", { cache: "no-store", signal: ac.signal });
        if (alive && brandRes.ok) {
          const j = (await brandRes.json()) as SeoBrandPublic;
          if (typeof j.siteName === "string" && j.siteName) setSiteName(j.siteName);
          if (typeof j.logoTitle === "string" && j.logoTitle) setLogoTitle(j.logoTitle);
          if (typeof j.tagline === "string") setTagline(j.tagline);
          if (typeof j.logoUrl === "string" && j.logoUrl) setLogoUrl(j.logoUrl);

          if (j.footer?.aboutText && typeof j.footer.aboutText === "string") setFooterAboutText(j.footer.aboutText);
          if (j.footer?.appLinks && typeof j.footer.appLinks === "object") setFooterAppLinks(j.footer.appLinks);
          if (j.footer?.socials && typeof j.footer.socials === "object") setFooterSocials(j.footer.socials);
        }

        // 2) company pages (try /company-pages first, fallback to /pages)
        const tryFetch = async (url: string) => {
          const r = await fetch(url, { cache: "no-store", signal: ac.signal });
          if (!r.ok) return null;
          return r.json();
        };

        const pagesJson =
          (await tryFetch("/api/public/company-pages")) ??
          (await tryFetch("/api/public/pages"));

        if (alive && pagesJson) {
          setExtraCompanyLinks(parseCompanyPages(pagesJson));
        }
      } catch {
        // ignore network errors
      }
    })();

    return () => {
      alive = false;
      ac.abort();
    };
  }, []);

  const aboutText = footerAboutText.replace("{siteName}", siteName);

  return (
    <footer className="w-full theme-bg theme-border border-t pt-16 pb-8 text-sm font-sans relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12 theme-border border-b pb-12">
          <div className="lg:w-2/3 space-y-4">
            <Link href="/" prefetch={false} className="flex items-center gap-3 w-fit group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm theme-border border bg-white/60 dark:bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl || "/brand/logo.svg"}
                  alt={logoTitle || siteName}
                  title={logoTitle || siteName}
                  className="w-6 h-6"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>

              <div className="leading-tight">
                <div className="text-2xl font-bold tracking-tight text-primary">{siteName}</div>
                <div className="text-xs text-secondary">{tagline}</div>
              </div>
            </Link>

            <p className="leading-relaxed text-secondary text-xs md:text-sm max-w-2xl">{aboutText}</p>
          </div>

          <div className="lg:w-1/3 flex flex-col items-start lg:items-end gap-4">
            <span className="text-primary font-bold text-xs uppercase tracking-wider">Get the mobile app</span>

            <div className="flex flex-row flex-wrap gap-3">
              {FOOTER.appLinks.map(({ key, name, url, Icon }) => {
                const overrideUrl = key === "googlePlay" ? footerAppLinks?.googlePlay : footerAppLinks?.appStore;

                return (
                  <SmartExternalLink key={name} href={overrideUrl || url} ariaLabel={name} className="group">
                    <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 border theme-border bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all shadow-sm">
                      <Icon size={20} className="opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="text-left">
                        <div className="text-[10px] uppercase opacity-70 leading-none mb-0.5">Download on</div>
                        <div className="font-bold text-sm leading-tight">{name}</div>
                      </div>
                    </div>
                  </SmartExternalLink>
                );
              })}
            </div>

            <div className="text-[11px] text-secondary">(Links can be connected later in admin.)</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 mb-12">
          {FOOTER.columns.map((col) => {
            const links = col.title === "Company" ? companyLinks : col.links;

            return (
              <nav key={col.title} aria-label={`${col.title} navigation`}>
                <h3 className="text-primary font-bold mb-4 uppercase tracking-wide text-xs">{col.title}</h3>

                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.url}>
                      <Link
                        href={link.url}
                        prefetch={false}
                        className="text-secondary hover:text-primary transition-colors text-xs md:text-sm hover:underline decoration-blue-600/30 underline-offset-4"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <div className="theme-border border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          <div className="text-secondary order-2 md:order-1">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </div>

          <div className="flex items-center gap-3 order-1 md:order-2">
            {FOOTER.socials.map(({ key, Icon, label, href }) => {
              const overrideHref =
                key === "twitter"
                  ? footerSocials?.twitter
                  : key === "facebook"
                    ? footerSocials?.facebook
                    : key === "instagram"
                      ? footerSocials?.instagram
                      : footerSocials?.youtube;

              return (
                <SmartExternalLink
                  key={label}
                  href={overrideHref || href}
                  ariaLabel={label}
                  className="p-2.5 theme-bg theme-border border rounded-full hover:opacity-90 transition-all text-secondary"
                >
                  <Icon size={16} />
                </SmartExternalLink>
              );
            })}
          </div>

          <nav aria-label="Legal navigation" className="flex gap-6 text-secondary font-medium order-3">
            <Link href="/blog" prefetch={false} className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link href="/faqs" prefetch={false} className="hover:text-primary transition-colors">
              FAQs
            </Link>
            <Link href="/privacy-policy" prefetch={false} className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" prefetch={false} className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="/contact" prefetch={false} className="hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
