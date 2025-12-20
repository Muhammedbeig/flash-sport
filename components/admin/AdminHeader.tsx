"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import AdminThemeToggle from "@/components/admin/AdminThemeToggle";
import AdminUserMenu from "@/components/admin/AdminUserMenu";

export default function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const headerClass = isDark ? "theme-bg theme-border border-b" : "bg-[#0f80da] border-none";
  const logoTextClass = isDark ? "text-primary" : "text-white";
  const logoBgClass = isDark ? "bg-[#0f80da] text-white" : "bg-white text-[#0f80da]";

  const iconBtnClass = `p-2 rounded-md transition-colors ${
    isDark ? "text-secondary hover:bg-slate-800" : "text-white hover:bg-white/10"
  }`;

  return (
    <header className={`${headerClass} sticky top-0 z-50 shadow-sm transition-colors duration-200`}>
      <div className="flex items-center justify-between px-4 h-14 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          <button type="button" onClick={onMenuClick} className={`lg:hidden ${iconBtnClass}`} aria-label="Open menu">
            <Menu size={24} />
          </button>

          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0 ${logoBgClass}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo.svg" alt="Live Score" className="w-5 h-5" loading="eager" decoding="async" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className={`text-lg font-bold tracking-tight truncate ${logoTextClass}`}>LiveSocer Admin</div>
              <div className={`${isDark ? "text-secondary" : "text-white/80"} text-[11px] -mt-0.5`}>Control Panel</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {/* User menu LEFT of theme toggle (as you asked) */}
          <AdminUserMenu />
          <AdminThemeToggle variant="header" />
        </div>
      </div>
    </header>
  );
}
