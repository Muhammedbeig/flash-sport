"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSeoStore } from "@/lib/admin/seo-admin-client";
import { useAdminAuth } from "@/components/admin/auth/AdminAuthProvider";

export default function AdminDashboard() {
  const BYPASS = process.env.NEXT_PUBLIC_ADMIN_BYPASS_AUTH === "true";
  const { user } = useAdminAuth();
  const email = BYPASS ? "adminb@livesoccerr.com" : user?.email || "admin@livesoccerr.com";

  const [loading, setLoading] = useState(true);
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [titlePrefix, setTitlePrefix] = useState("");
  const [titleSuffix, setTitleSuffix] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const store = await fetchSeoStore();
        if (!alive) return;
        setPagesCount(Object.keys(store.pages || {}).length);
        setTitlePrefix(store.brand.titlePrefix || "");
        setTitleSuffix(store.brand.titleSuffix || "");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="theme-bg border theme-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-primary">Dashboard</h1>
            <p className="text-sm text-secondary mt-1">
              Welcome, <span className="font-semibold text-primary">{email}</span>. Admin is running ✅
            </p>
            {BYPASS ? (
              <p className="text-xs text-secondary mt-1">Auth is currently bypassed for development.</p>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Link
              href="/seo/global"
              className="px-4 py-2 rounded-lg bg-[#0f80da] text-white font-bold uppercase tracking-wide text-xs hover:opacity-95"
            >
              Edit Global SEO
            </Link>
            <Link
              href="/seo/pages"
              className="px-4 py-2 rounded-lg border theme-border text-secondary font-bold uppercase tracking-wide text-xs hover:text-primary"
            >
              Open Page SEO
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ModuleCard
          title="Global Settings"
          desc="Title prefix/suffix, default OG image, default meta description, auto rules."
          href="/seo/global"
          meta={loading ? "Loading..." : `Prefix: "${titlePrefix || "-"}" • Suffix: "${titleSuffix || "-"}"`}
        />
        <ModuleCard
          title="SEO Manager (Page SEO)"
          desc="Edit required + advanced fields per page (title, desc, canonical, schema, robots, scripts)."
          href="/seo/pages"
          meta={loading ? "Loading..." : `${pagesCount} pages available`}
          badge="NEXT"
        />
        <ModuleCard
          title="Match SEO (Dynamic)"
          desc="Templates for match pages: title/description/schema + OG banner strategy."
          href="/seo/matches"
          meta="Powered by match-seo + resolver"
        />
      </div>

      <div className="theme-bg border theme-border rounded-xl p-6">
        <div className="text-xs font-black uppercase tracking-widest text-secondary">Roadmap</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border theme-border p-4">
            <div className="text-xs font-black uppercase tracking-widest text-secondary">Later</div>
            <div className="mt-2 text-sm font-semibold text-primary">Roles & Permissions</div>
            <div className="mt-1 text-xs text-secondary">Admin-only access controls.</div>
          </div>
          <div className="rounded-xl border theme-border p-4">
            <div className="text-xs font-black uppercase tracking-widest text-secondary">Soon</div>
            <div className="mt-2 text-sm font-semibold text-primary">SEO Overrides UI</div>
            <div className="mt-1 text-xs text-secondary">
              Override keys like <span className="font-mono">sports:football:live</span> or{" "}
              <span className="font-mono">match:football:123:lineups</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModuleCard({
  title,
  desc,
  href,
  meta,
  badge,
}: {
  title: string;
  desc: string;
  href: string;
  meta?: string;
  badge?: string;
}) {
  return (
    <div className="theme-bg border theme-border rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-lg font-black text-primary">{title}</div>
          <div className="text-sm text-secondary mt-1">{desc}</div>
        </div>
        {badge ? (
          <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border theme-border text-secondary">
            {badge}
          </div>
        ) : null}
      </div>

      {meta ? <div className="text-xs text-secondary mt-3">{meta}</div> : null}

      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex px-3 py-2 rounded-lg bg-[#0f80da] text-white font-bold uppercase tracking-wide text-xs hover:opacity-95"
        >
          Open
        </Link>
      </div>
    </div>
  );
}
