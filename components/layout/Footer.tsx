"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Smartphone } from "lucide-react";

const FOOTER_CONTENT = {
  about: {
    title: "About FlashSport",
    text: "FlashSport provides you with live scores, results, tables, statistics, fixtures, standings, and previous results by quarters, halftime, or final result. We offer scores service from more than 200 basketball and football competitions from around the world. Follow live results, stats, and team rosters on FlashSport."
  },
  appLinks: [
    { name: "Google Play", url: "#" },
    { name: "App Store", url: "#" },
    { name: "AppGallery", url: "#" }
  ],
  columns: [
    {
      title: "Top Leagues",
      links: [
        { label: "Premier League", url: "/?sport=football&league=39" },
        { label: "Champions League", url: "/?sport=football&league=2" },
        { label: "NBA Schedule", url: "/?sport=nba" },
        { label: "La Liga Standings", url: "/?sport=football&league=140" },
        { label: "Serie A Fixtures", url: "/?sport=football&league=135" },
        { label: "Bundesliga Results", url: "/?sport=football&league=78" },
      ]
    },
    {
      title: "Football",
      links: [
        { label: "Transfer News", url: "/news" },
        { label: "Live Scores", url: "/?view=live" },
        { label: "Prediction", url: "#" },
        { label: "Head to Head", url: "#" },
        { label: "FIFA World Cup", url: "/?sport=football&league=1" },
        { label: "EPL Standings 2024-25", url: "/?sport=football&league=39" },
      ]
    },
    {
      title: "Basketball",
      links: [
        { label: "NBA Player Stats", url: "/?sport=nba" },
        { label: "Basketball Live Score", url: "/?sport=basketball" },
        { label: "NBA Schedule", url: "/?sport=nba" },
        { label: "NBA Standings", url: "/?sport=nba" },
        { label: "NBA Teams", url: "/?sport=nba" },
        { label: "CBA Schedule", url: "#" },
      ]
    },
    {
      title: "Useful Links",
      links: [
        { label: "Contact Us", url: "#" },
        { label: "Advertise", url: "#" },
        { label: "Privacy Policy", url: "#" },
        { label: "Terms of Service", url: "#" },
        { label: "Recommended Sites", url: "#" },
        { label: "FAQ", url: "#" },
      ]
    }
  ],
  localized: [
    { label: "Basketball LiveScore", url: "#" },
    { label: "Bola Basket LiveScore", url: "#" },
    { label: "Баскетбол LiveScore", url: "#" },
    { label: "LiveScore de basquete", url: "#" },
    { label: "Košarka LiveScore", url: "#" },
    { label: "농구 라이브 스코어", url: "#" },
  ]
};

export default function Footer() {
  return (
    <footer className="theme-bg theme-border border-t pt-12 pb-8 text-secondary text-sm font-sans mt-auto">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* TOP AREA */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 mb-12 theme-border border-b pb-10">
          
          {/* ABOUT SECTION */}
          <div className="lg:w-2/3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                F
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-primary">
                FlashSport
              </h2>
            </div>

            <p className="leading-relaxed text-secondary text-xs md:text-sm text-justify max-w-3xl">
              {FOOTER_CONTENT.about.text}
            </p>
          </div>

          {/* DOWNLOAD BUTTONS */}
          <div className="lg:w-1/3 flex flex-col gap-3 items-start lg:items-end">
            <span className="text-primary font-bold mb-1 text-xs uppercase tracking-wide">
              Download App
            </span>

            {FOOTER_CONTENT.appLinks.map((app) => (
              <button
                key={app.name}
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg w-48 transition-colors shadow-sm"
              >
                <Smartphone size={20} />
                <div className="text-left">
                  <div className="text-[9px] uppercase text-slate-400 leading-none">
                    Get it on
                  </div>
                  <div className="font-bold text-sm leading-tight">{app.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* LINK COLUMNS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {FOOTER_CONTENT.columns.map((col, index) => (
            <div key={index}>
              <h3 className="text-primary font-bold mb-4 uppercase tracking-wide text-xs">
                {col.title}
              </h3>

              <ul className="space-y-2">
                {col.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.url}
                      className="text-secondary hover:text-blue-600 transition-colors hover:underline decoration-blue-200 underline-offset-4 text-xs md:text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* LOCALIZED LINKS */}
        <div className="theme-border border-t pt-8 mb-8">
          <h3 className="text-primary font-bold mb-4 text-sm">
            Visit localized versions
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {FOOTER_CONTENT.localized.map((loc, i) => (
              <Link
                key={i}
                href={loc.url}
                className="text-secondary hover:text-blue-600 transition-colors text-xs"
              >
                {loc.label}
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="theme-border border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
          
          {/* COPYRIGHT */}
          <div className="text-secondary">
            Copyright © 2025 FlashSport | All Rights Reserved
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex items-center gap-4">
            {[Twitter, Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 theme-bg theme-border border rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-secondary"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>

          {/* LEGAL LINKS */}
          <div className="flex gap-6 text-secondary font-medium">
            <Link href="#" className="hover:text-blue-600">Privacy</Link>
            <Link href="#" className="hover:text-blue-600">Terms</Link>
            <Link href="#" className="hover:text-blue-600">Contact</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
