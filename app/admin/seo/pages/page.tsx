"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchSeoStore } from "@/lib/admin/seo-admin-client";

export default function SeoPagesList() {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const store = await fetchSeoStore();
        if (!alive) return;
        setKeys(Object.keys(store.pages || {}).sort());
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="theme-bg border theme-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-primary">SEO Manager (Page SEO)</h1>
        <p className="text-sm text-secondary mt-1">Edit all required + advanced SEO fields per page.</p>
      </div>

      <div className="theme-bg border theme-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b theme-border text-xs font-black uppercase tracking-widest text-secondary">
          Pages
        </div>

        {loading ? (
          <div className="p-4 text-sm text-secondary">Loading...</div>
        ) : (
          <div className="divide-y theme-border">
            {keys.map((k) => (
              <Link
                key={k}
                href={`/seo/pages/${encodeURIComponent(k)}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <div>
                  <div className="text-sm font-semibold text-primary">{k}</div>
                  <div className="text-xs text-secondary">Edit page SEO</div>
                </div>
                <span className="text-xs font-bold text-secondary">Edit</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
