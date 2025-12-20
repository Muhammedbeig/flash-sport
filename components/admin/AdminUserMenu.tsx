"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAdminAuth } from "@/components/admin/auth/AdminAuthProvider";

function initials(email?: string | null) {
  if (!email) return "AD";
  const left = email.split("@")[0] || "admin";
  const parts = left.split(/[._-]/).filter(Boolean);
  const a = (parts[0]?.[0] || "a").toUpperCase();
  const b = (parts[1]?.[0] || "").toUpperCase();
  return `${a}${b}`.slice(0, 2);
}

export default function AdminUserMenu() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { user, logout } = useAdminAuth();
  const BYPASS = process.env.NEXT_PUBLIC_ADMIN_BYPASS_AUTH === "true";
  const email = BYPASS ? "adminb@livesoccerr.com" : user?.email || "admin@livesoccerr.com";

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const avatarText = useMemo(() => initials(email), [email]);

  // Match main Header button hover styles
  const triggerClass = `inline-flex items-center gap-2 h-10 px-2 rounded-md transition-colors ${
    isDark ? "text-secondary hover:bg-slate-800" : "text-white/90 hover:bg-white/20"
  }`;

  // Match main Sidebar hover styles
  const itemClass = (active?: boolean) => {
    if (isDark) return active ? "bg-slate-900 text-blue-400" : "text-secondary hover:text-slate-200 hover:bg-slate-800";
    return active ? "bg-blue-50 text-blue-700" : "text-secondary hover:text-primary hover:bg-slate-50";
  };

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      setOpen(false);
      router.push("/login");
    }
  };

  const avatarBg = isDark ? "bg-[#0f80da] text-white" : "bg-white text-[#0f80da]";

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((s) => !s)} className={triggerClass} aria-label="Account menu">
        <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full font-black text-xs ${avatarBg}`}>
          {avatarText}
        </span>
        <span className="hidden md:inline text-xs font-bold max-w-[220px] truncate">{email}</span>
        <ChevronDown size={16} className={isDark ? "text-secondary" : "text-white/80"} />
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-64 rounded-xl theme-bg theme-border border shadow-xl overflow-hidden z-[80]">
          <div className="px-4 py-3 border-b theme-border">
            <div className="text-[10px] font-black uppercase tracking-widest text-secondary">Signed in</div>
            <div className="text-sm font-semibold text-primary truncate mt-1">{email}</div>
            {BYPASS ? (
              <div className="mt-2 inline-flex text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border theme-border text-secondary">
                DEV BYPASS
              </div>
            ) : null}
          </div>

          <div className="p-2">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${itemClass(false)}`}
            >
              <Settings size={16} />
              Settings
            </Link>

            <button
              type="button"
              onClick={onLogout}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${itemClass(false)}`}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
