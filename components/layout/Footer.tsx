"use client";

import Link from "next/link";
import { Smartphone, Twitter, Facebook, Instagram, Youtube, Globe } from "lucide-react";

const FOOTER_CONTENT = {
  about: {
    title: "About LiveSocer",
    text: `LiveSocer provides the fastest real-time sports scores, fixtures, results, standings, 
    and statistics covering more than 30 sports worldwide. Stay updated with live score updates 
    and deep insights into your favorite leagues like the Premier League, NBA, and Champions League.`,
  },
  appLinks: [
    { name: "Google Play", url: "#" },
    { name: "App Store", url: "#" },
  ],
  columns: [
    {
      title: "Football",
      links: [
        { label: "Football Livescore", url: "/?sport=football" },
        { label: "Premier League", url: "/?sport=football&league=39" },
        { label: "LaLiga Fixtures", url: "/?sport=football&league=140" },
        { label: "Serie A Results", url: "/?sport=football&league=135" },
        { label: "Bundesliga Table", url: "/?sport=football&league=78" },
        { label: "Ligue 1 Stats", url: "/?sport=football&league=61" },
      ],
    },
    {
      title: "Trending",
      links: [
        { label: "World Cup 2026", url: "/?sport=football&league=1" },
        { label: "Champions League", url: "/?sport=football&league=2" },
        { label: "Europa League", url: "/?sport=football&league=3" },
        { label: "Euro 2024", url: "/?sport=football&league=4" },
        { label: "Copa Libertadores", url: "/?sport=football&league=13" },
      ],
    },
    {
      title: "Basketball & Tennis",
      links: [
        { label: "NBA Scores", url: "/?sport=nba" },
        { label: "Basketball Live", url: "/?sport=basketball" },
        { label: "EuroLeague", url: "#" },
        { label: "Tennis ATP", url: "/?sport=tennis" },
        { label: "WTA Live", url: "/?sport=tennis" },
      ],
    },
    {
      title: "Community",
      links: [
        { label: "Contact Us", url: "/contact" },
        { label: "Privacy Policy", url: "/privacy-policy" }, // Points to your new page
        { label: "Terms of Service", url: "/terms-of-service" },
      ],
    },
  ],
  localized: [
    { label: "Soccer LiveScore", url: "#" },
    { label: "Bola Basket LiveScore", url: "#" },
    { label: "Баскетбол LiveScore", url: "#" },
    { label: "LiveScore de basquete", url: "#" },
    { label: "Košarka LiveScore", url: "#" },
    { label: "농구 라이브 스코어", url: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full theme-bg theme-border border-t pt-16 pb-8 text-sm font-sans relative z-10">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* ============================
            TOP AREA: Brand & Apps
        ============================ */}
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12 theme-border border-b pb-12">
          
          {/* BRANDING */}
          <div className="lg:w-2/3 space-y-4">
            <Link href="/" className="flex items-center gap-3 w-fit group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                L
              </div>
              <span className="text-2xl font-bold tracking-tight text-primary">
                LiveSocer
              </span>
            </Link>

            <p className="leading-relaxed text-secondary text-xs md:text-sm max-w-2xl">
              {FOOTER_CONTENT.about.text}
            </p>
          </div>

          {/* APP DOWNLOAD CTA */}
          <div className="lg:w-1/3 flex flex-col items-start lg:items-end gap-4">
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              Get the Mobile App
            </span>

            <div className="flex flex-row gap-3">
              {FOOTER_CONTENT.appLinks.map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm group"
                >
                  <Smartphone size={22} className="text-slate-400 group-hover:text-white transition-colors" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase text-slate-400 leading-none mb-0.5">
                      Download on
                    </div>
                    <div className="font-bold text-sm leading-tight">{app.name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ============================
            MAIN LINKS GRID
        ============================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 mb-12">
          {FOOTER_CONTENT.columns.map((col, index) => (
            <nav key={index} aria-label={`${col.title} navigation`}>
              <h3 className="text-primary font-bold mb-4 uppercase tracking-wide text-xs">
                {col.title}
              </h3>

              <ul className="space-y-2.5">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.url}
                      className="text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs md:text-sm hover:underline decoration-blue-600/30 underline-offset-4"
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
            LOCALIZED / SEO LINKS
        ============================ */}
        <div className="theme-border border-t pt-8 mb-8">
          <div className="flex items-center gap-2 mb-4 text-primary font-bold text-sm">
            <Globe size={16} />
            <h3>International Versions</h3>
          </div>

          <nav aria-label="International versions" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {FOOTER_CONTENT.localized.map((loc, i) => (
              <a
                key={i}
                href={loc.url}
                className="text-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xs"
              >
                {loc.label}
              </a>
            ))}
          </nav>
        </div>

        {/* ============================
            BOTTOM BAR
        ============================ */}
        <div className="theme-border border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          
          {/* COPYRIGHT */}
          <div className="text-secondary order-2 md:order-1">
            &copy; {new Date().getFullYear()} LiveSocer Inc. All Rights Reserved.
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            {[
              { Icon: Twitter, label: "Twitter" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Youtube, label: "YouTube" }
            ].map(({ Icon, label }, i) => (
              <a
                key={i}
                href="#"
                aria-label={label}
                className="p-2.5 theme-bg theme-border border rounded-full hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-secondary"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* LEGAL */}
          <nav aria-label="Legal navigation" className="flex gap-6 text-secondary font-medium order-3">
            <Link 
              href="/privacy-policy" 
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</Link>
          </nav>
        </div>

      </div>
    </footer>
  );
}