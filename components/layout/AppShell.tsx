"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import Link from "next/link";

type AppShellProps = {
  children: ReactNode;
};

const MOBILE_SPORTS = [
  { name: "Football", id: "football" },
  { name: "Basketball", id: "basketball" },
  { name: "Hockey", id: "hockey" },
  { name: "Baseball", id: "baseball" },
];

export default function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      
      {/* 1. HEADER (Horizontal Navigation) */}
      <Header />

      <div className="flex flex-1 container mx-auto max-w-7xl">
        
        {/* 2. SIDEBAR (Pinned Leagues) */}
        <Sidebar />

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-gray-700">
              <Menu size={24} />
            </button>
            <span className="font-bold text-blue-600 text-lg">FlashSport</span>
            <div className="w-8"></div>
          </div>

          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay (Unchanged) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-72 h-full shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between mb-6">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}><X /></button>
            </div>
            <div className="space-y-4">
              {MOBILE_SPORTS.map(s => (
                <Link key={s.id} href={`/?sport=${s.id}`} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 border-b border-gray-50">
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}