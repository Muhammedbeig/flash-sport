"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
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
        
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-0 md:p-6 min-w-0 theme-bg">
          <div className="p-4 theme-bg rounded-xl border-0 transition-colors duration-200 text-primary">
            {children}
          </div>
        </main>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none"
        }`}
      >
        {/* BACKDROP */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* MOBILE SIDEBAR PANEL */}
        <aside
          className={`absolute top-0 right-0 bottom-0 theme-bg theme-border border-l w-72 h-full shadow-2xl overflow-y-auto text-primary transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 theme-border border-b">
            <h2 className="font-bold text-xl tracking-wide text-primary">
              Menu
            </h2>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-secondary hover:text-primary"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4 space-y-8 text-secondary">
            {/* You can include mobile menu items here */}
          </div>
        </aside>
      </div>
    </div>
  );
}
