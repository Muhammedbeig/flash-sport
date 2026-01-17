"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AdminAuthProvider } from "@/components/admin/auth/AdminAuthProvider";
import AdminAuthGate from "@/components/admin/auth/AdminAuthGate";
import AdminShell from "@/components/admin/AdminShell";
import { stripAdminBase } from "@/lib/adminPath";

export default function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = stripAdminBase(usePathname() || "");

  // FIX: Use 'startsWith' to catch "/login", "/login/", or "/admin/login" properly
  const isLogin = pathname.startsWith("/login");

  return (
    <AdminAuthProvider>
      <AdminAuthGate>
        {/* If isLogin is true, render ONLY the page content (children). 
            If false, wrap it in AdminShell (which contains the Sidebar/Header). */}
        {isLogin ? children : <AdminShell>{children}</AdminShell>}
      </AdminAuthGate>
    </AdminAuthProvider>
  );
}

