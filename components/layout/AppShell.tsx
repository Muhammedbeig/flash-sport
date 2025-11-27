"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav"; // Import the new component
import { X } from "lucide-react";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen theme-bg transition-colors duration-200">

      {/* HEADER */}
      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 container mx-auto max-w-7xl theme-bg">

        {/* SIDEBAR (DESKTOP) - hidden on mobile */}
        <Sidebar className="hidden lg:block" />

        {/* MAIN CONTENT */}
        <main className="flex-1 p-0 md:p-6 min-w-0 theme-bg pb-20 lg:pb-6"> 
          {/* Added pb-20 to prevent content from being hidden behind Mobile Nav */}
          <div className="p-4 theme-bg rounded-xl border-0 transition-colors duration-200">
            {children}
          </div>
        </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileNav />

      {/* MOBILE MENU DRAWER (Existing) */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        {/* BACKDROP */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* DRAWER PANEL */}
        <aside
          className={`absolute top-0 right-0 bottom-0 theme-bg theme-border border-l w-72 h-full shadow-2xl overflow-y-auto transition-transform duration-300 text-primary ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 theme-border border-b">
            <h2 className="font-bold text-xl tracking-wide text-primary">Menu</h2>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-secondary hover:text-primary"
            >
              <X size={24} />
            </button>
          </div>

          {/* SIDEBAR (MOBILE) - Rendered inside drawer */}
          <div className="h-full">
            <Sidebar 
              className="w-full h-auto static border-none shadow-none pb-20" 
              onLinkClick={() => setMobileMenuOpen(false)}
            />
          </div>
        </aside>
      </div>

    </div>
  );
}