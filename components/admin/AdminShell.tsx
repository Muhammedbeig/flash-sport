"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const closeBtn = `inline-flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
    isDark ? "text-secondary hover:bg-slate-800" : "text-secondary hover:bg-slate-100 hover:text-primary"
  }`;

  return (
    <div className="min-h-screen theme-bg text-primary">
      <AdminHeader onMenuClick={() => setOpen(true)} />

      <div className="max-w-7xl mx-auto w-full px-0 lg:px-4">
        <div className="flex">
          <aside className="hidden lg:block w-72 shrink-0 min-h-[calc(100vh-56px)]">
            <AdminSidebar />
          </aside>

          <main className="flex-1 min-w-0 px-4 py-6 lg:px-6">{children}</main>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-[60] lg:hidden ${open ? "visible" : "invisible"} `}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
          onClick={() => setOpen(false)}
        />

        <aside
          className={`absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] h-full shadow-2xl overflow-y-auto transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          } theme-bg theme-border border-r`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b theme-border">
            <div className="font-bold text-primary">Menu</div>
            <button type="button" onClick={() => setOpen(false)} className={closeBtn} aria-label="Close menu">
              <X size={18} />
            </button>
          </div>

          <AdminSidebar onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </div>
  );
}
