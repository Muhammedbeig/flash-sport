"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Footer from "./Footer"; 
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

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto theme-bg relative">
        
        <div className="flex flex-1 items-start">
          
          {/* SIDEBAR (DESKTOP) */}
          {/* REMOVED: sticky top-16 h-[calc(100vh-64px)] overflow-y-auto 
             ADDED: min-h-screen (to ensure border goes down if content is short)
          */}
          <Sidebar className="hidden lg:block w-64 min-h-screen pb-4" />

          {/* MAIN FEED */}
          <main className="flex-1 min-w-0 w-full p-0 md:p-6 theme-bg">
            <div className="theme-bg rounded-xl min-h-[60vh]">
              {children}
            </div>
          </main>
        </div>

      </div>

      {/* FOOTER */}
      <div className="w-full theme-bg theme-border border-t relative z-20 mt-auto">
         <Footer />
      </div>

      {/* MOBILE NAV */}
      <MobileNav />

      {/* MOBILE MENU DRAWER */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-all duration-300 ${
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