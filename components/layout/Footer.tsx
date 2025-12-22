"use client";

import Link from "next/link";
import {
  Apple,
  Play,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";
import { SEO_CONTENT } from "@/lib/seo/seo-central";

type FooterLink = { label: string; url: string };

const FOOTER = {
  // ✅ FIX: Use placeholder {siteName} instead of hardcoded string
  aboutText:
    "{siteName} delivers fast, real-time scores, fixtures, results, standings, and match stats across football, basketball, NFL, hockey, baseball, rugby, volleyball and more — all in one place.",

  appLinks: [
    { name: "Google Play", url: "#", Icon: Play },
    { name: "App Store", url: "#", Icon: Apple },
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
        { label: "Privacy Policy", url: "/privacy-policy" },
        { label: "Terms of Service", url: "/terms-of-service" },
      ] as FooterLink[],
    },
  ],

  socials: [
    { Icon: Twitter, label: "Twitter", href: "#" },
    { Icon: Facebook, label: "Facebook", href: "#" },
    { Icon: Instagram, label: "Instagram", href: "#" },
    { Icon: Youtube, label: "YouTube", href: "#" },
  ],
};

function SmartExternalLink({
  href,
  children,
  className,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
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

export default function Footer() {
  // ✅ FIX: Robust fallback to prevent crashes if SEO_CONTENT is undefined during build
  const brand = SEO_CONTENT?.brand || {
    siteName: "LiveSocceRR",
    logoTitle: "LiveSocceRR Scores",
    tagline: "Soccer Scores. Right Now.",
  };

  return (
    <footer className="w-full theme-bg theme-border border-t pt-16 pb-8 text-sm font-sans relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* ============================
            TOP: Brand + App Buttons
        ============================ */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12 theme-border border-b pb-12">
          {/* BRAND */}
          <div className="lg:w-2/3 space-y-4">
            <Link href="/" prefetch={false} className="flex items-center gap-3 w-fit group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm theme-border border bg-white/60 dark:bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/logo.svg"
                  alt={brand.siteName} // ✅ FIX: Using siteName
                  className="w-6 h-6"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              </div>

              <div className="leading-tight">
                <div className="text-2xl font-bold tracking-tight text-primary">
                  {brand.siteName}
                </div>
                <div className="text-xs text-secondary">{brand.tagline}</div>
              </div>
            </Link>

            <p className="leading-relaxed text-secondary text-xs md:text-sm max-w-2xl">
              {/* ✅ FIX: Dynamically inject siteName into the text */}
              {FOOTER.aboutText.replace("{siteName}", brand.siteName)}
            </p>
          </div>

          {/* APP DOWNLOAD */}
          <div className="lg:w-1/3 flex flex-col items-start lg:items-end gap-4">
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              Get the mobile app
            </span>

            <div className="flex flex-row flex-wrap gap-3">
              {FOOTER.appLinks.map(({ name, url, Icon }) => (
                <SmartExternalLink
                  key={name}
                  href={url}
                  ariaLabel={name}
                  className="group"
                >
                  {/* High contrast both modes */}
                  <div className="flex items-center gap-3 rounded-xl px-4 py-2.5 border theme-border bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all shadow-sm">
                    <Icon size={20} className="opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="text-left">
                      <div className="text-[10px] uppercase opacity-70 leading-none mb-0.5">
                        Download on
                      </div>
                      <div className="font-bold text-sm leading-tight">{name}</div>
                    </div>
                  </div>
                </SmartExternalLink>
              ))}
            </div>

            <div className="text-[11px] text-secondary">
              (Links can be connected later in admin.)
            </div>
          </div>
        </div>

        {/* ============================
            MAIN LINKS GRID
        ============================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 mb-12">
          {FOOTER.columns.map((col) => (
            <nav key={col.title} aria-label={`${col.title} navigation`}>
              <h3 className="text-primary font-bold mb-4 uppercase tracking-wide text-xs">
                {col.title}
              </h3>

              <ul className="space-y-2.5">
                {col.links.map((link) => (
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
          ))}
        </div>

        {/* ============================
            BOTTOM BAR
        ============================ */}
        <div className="theme-border border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          {/* COPYRIGHT */}
          <div className="text-secondary order-2 md:order-1">
            {/* ✅ FIX: Dynamic Site Name */}
            &copy; {new Date().getFullYear()} {brand.siteName}. All rights reserved.
          </div>

          {/* SOCIAL */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            {FOOTER.socials.map(({ Icon, label, href }) => (
              <SmartExternalLink
                key={label}
                href={href}
                ariaLabel={label}
                className="p-2.5 theme-bg theme-border border rounded-full hover:opacity-90 transition-all text-secondary"
              >
                <Icon size={16} />
              </SmartExternalLink>
            ))}
          </div>

          {/* LEGAL */}
          <nav
            aria-label="Legal navigation"
            className="flex gap-6 text-secondary font-medium order-3"
          >
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