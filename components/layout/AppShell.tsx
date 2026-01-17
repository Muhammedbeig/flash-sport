"use client";

import { ReactNode, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Footer from "./Footer";
import { X } from "lucide-react";

type AppShellProps = {
  children: ReactNode;
};

// Fallback for navigation parts (invisible or simple loader)
function NavFallback() {
  return (
    <div className="animate-pulse bg-slate-200 dark:bg-slate-800 h-full w-full opacity-50" />
  );
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <div className="min-h-screen theme-bg">{children}</div>;
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen theme-bg transition-colors duration-200">
      {/* HEADER (Uses searchParams, needs Suspense) */}
      <Suspense fallback={<div className="h-16 border-b theme-border theme-bg" />}>
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
      </Suspense>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto theme-bg relative">
        <div className="flex flex-1 items-start">
          {/* SIDEBAR (DESKTOP) (Uses searchParams, needs Suspense) */}
          <aside className="hidden lg:block w-64 min-h-screen pb-4 theme-border border-r">
            <Suspense fallback={<NavFallback />}>
              <Sidebar className="h-full" />
            </Suspense>
          </aside>

          {/* MAIN FEED */}
          <main className="flex-1 min-w-0 w-full p-0 md:p-6 theme-bg">
            <div className="theme-bg rounded-xl min-h-[60vh]">{children}</div>
          </main>
        </div>
      </div>

      {/* FOOTER */}
      <div className="w-full theme-bg theme-border border-t relative z-20 mt-auto">
        <Footer />
      </div>

      {/* MOBILE NAV (MOBILE ONLY) (Uses searchParams, needs Suspense) */}
      <Suspense fallback={null}>
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </Suspense>

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
            {/* SIDEBAR INSIDE MOBILE DRAWER (Uses searchParams, needs Suspense) */}
            <Suspense fallback={<div className="p-4 text-sm text-secondary">Loading menu...</div>}>
              <Sidebar
                className="w-full h-auto static border-none shadow-none pb-20"
                onLinkClick={() => setMobileMenuOpen(false)}
              />
            </Suspense>
          </div>
        </aside>
      </div>
    </div>
  );
}
