"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, FileText, Trophy, Shield, Settings } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";

type Item = { href: string; label: string; icon: React.ReactNode; badge?: string };

function normalize(p: string) {
  const x = (p || "").replace(/\/+$/, "");
  return x === "" ? "/" : x;
}

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = normalize(usePathname());
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isActive = (href: string) => {
    const h = normalize(href);
    const p = normalize(pathname);
    return p === h || (h !== "/" && p.startsWith(h));
  };

  const activeClass = isDark ? "bg-slate-800 text-blue-400 border-blue-500" : "bg-blue-50 text-blue-700 border-blue-600";
  const inactiveClass = isDark
    ? "text-secondary hover:bg-slate-800/50 hover:text-slate-200 border-transparent"
    : "text-secondary hover:bg-slate-100 hover:text-primary border-transparent";

  const NavItem = ({ item }: { item: Item }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium border-l-4 transition-all duration-200 ${
          active ? activeClass : inactiveClass
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="shrink-0">{item.icon}</span>
          <span className="truncate">{item.label}</span>
        </span>

        {item.badge ? (
          <span className={`text-[10px] font-black uppercase tracking-widest ${active ? "opacity-90" : "text-secondary"}`}>
            {item.badge}
          </span>
        ) : null}
      </Link>
    );
  };

  const dashboard: Item[] = [{ href: "/", label: "Dashboard", icon: <LayoutDashboard size={16} /> }];
  const seo: Item[] = [
    { href: "/seo/global", label: "Global Settings", icon: <Globe size={16} /> },
    { href: "/seo/pages", label: "SEO Manager (Page SEO)", icon: <FileText size={16} />, badge: "Next" },
    { href: "/seo/matches", label: "Match SEO (Dynamic)", icon: <Trophy size={16} /> },
  ];
  const later: Item[] = [{ href: "/roles", label: "Roles & Permissions", icon: <Shield size={16} />, badge: "Later" }];
  const admin: Item[] = [{ href: "/settings", label: "Settings", icon: <Settings size={16} /> }];

  return (
    <aside className="theme-bg theme-border border-r h-full">
      <nav className="p-4 space-y-6">
        <div className="space-y-1">{dashboard.map((it) => <NavItem key={it.href} item={it} />)}</div>

        <div>
          <div className="mb-2 px-3 text-xs font-bold text-secondary uppercase tracking-wider">SEO</div>
          <div className="space-y-1">{seo.map((it) => <NavItem key={it.href} item={it} />)}</div>
        </div>

        <div>
          <div className="mb-2 px-3 text-xs font-bold text-secondary uppercase tracking-wider">Later</div>
          <div className="space-y-1">{later.map((it) => <NavItem key={it.href} item={it} />)}</div>
        </div>

        <div>
          <div className="mb-2 px-3 text-xs font-bold text-secondary uppercase tracking-wider">Admin</div>
          <div className="space-y-1">{admin.map((it) => <NavItem key={it.href} item={it} />)}</div>
        </div>
      </nav>
    </aside>
  );
}
