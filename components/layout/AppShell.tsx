"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { X, Star, Globe, Plus, Shield } from "lucide-react";
import Link from "next/link";

type AppShellProps = {
  children: ReactNode;
};

const PINNED_LEAGUES = [
  { name: "Premier League", id: "39" },
  { name: "Ligue 1", id: "61" },
  { name: "Bundesliga", id: "78" },
  { name: "Serie A", id: "135" },
  { name: "LaLiga", id: "140" },
  { name: "Champions League", id: "2" },
];

export default function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* UNIFIED HEADER (Handles both Mobile & Desktop) */}
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 container mx-auto max-w-7xl">
        
        {/* DESKTOP SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-0 md:p-6 relative min-w-0">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE SIDEBAR DRAWER (Unchanged logic) */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`} 
          onClick={() => setMobileMenuOpen(false)} 
        />

        <aside 
          className={`absolute top-0 left-0 bottom-0 bg-slate-900 w-72 h-full shadow-2xl overflow-y-auto text-white transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-800">
            <h2 className="font-bold text-xl tracking-wide">Menu</h2>
            <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="p-4 space-y-8">
            
            {/* Pinned Leagues */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                Pinned Leagues
              </div>
              <div className="space-y-1">
                {PINNED_LEAGUES.map((l) => (
                  <Link 
                    key={l.id} 
                    href={`/?sport=football&league=${l.id}`} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="block px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* My Teams */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <div className="flex items-center gap-2">
                  <Shield size={12} />
                  My Teams
                </div>
                <Plus size={14} />
              </div>
              {/* Mobile Link to Favorites View */}
              <Link 
                href="/?sport=football&view=favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-3 bg-slate-800 rounded-lg border border-slate-700 text-center text-sm text-blue-400 font-medium"
              >
                View My Favorites
              </Link>
            </div>

            {/* Countries Widget */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                <Globe size={12} />
                Countries
              </div>
              <div className="min-h-[300px] bg-slate-800 rounded-xl overflow-hidden">
                 <div dangerouslySetInnerHTML={{ __html: `
                  <api-sports-widget 
                    data-type="leagues" 
                    data-sport="football"
                    data-target-league="#match-details-container" 
                    data-theme="dark" 
                    data-show-errors="false"
                  ></api-sports-widget>
                `}} />
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}