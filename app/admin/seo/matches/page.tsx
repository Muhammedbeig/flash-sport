"use client";

import { useEffect, useState } from "react";
import { fetchSeoStore, patchSeoStore } from "@/lib/admin/seo-admin-client";

export default function MatchSeoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [titleTemplate, setTitleTemplate] = useState("LIVE: {home} vs {away} – Score, Lineups & Stats");
  const [descriptionTemplate, setDescriptionTemplate] = useState(
    "Watch live score updates of {home} vs {away} with goals, lineups, news & match timeline. Fast updates on {brand}."
  );
  const [h1Template, setH1Template] = useState("LIVE: {home} vs {away}");
  const [autoSchema, setAutoSchema] = useState(true);

  const [useDynamicBanner, setUseDynamicBanner] = useState(true);
  const [bannerPath, setBannerPath] = useState("/og/match/{sport}/{id}");
  const [fallbackOg, setFallbackOg] = useState("/og.png");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const store = await fetchSeoStore();
        if (!alive) return;

        setTitleTemplate(store.match.titlePatterns?.[0] || titleTemplate);
        setDescriptionTemplate(store.match.descriptionPattern || descriptionTemplate);
        setH1Template(store.match.h1Pattern || h1Template);

        setAutoSchema(!!store.match.schema?.enabled);

        setUseDynamicBanner(!!store.match.og?.useDynamicBanner);
        setBannerPath(store.match.og?.bannerPath || "/og/match/{sport}/{id}");
        setFallbackOg(store.match.og?.fallbackImage || "/og.png");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await patchSeoStore({
        match: {
          titlePatterns: [titleTemplate, titleTemplate, titleTemplate] as any,
          descriptionPattern: descriptionTemplate,
          h1Pattern: h1Template,
          og: {
            useDynamicBanner,
            bannerPath,
            fallbackImage: fallbackOg,
          },
          schema: { enabled: autoSchema },
        } as any,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-bg border theme-border rounded-xl p-6">
        <div className="text-sm text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="theme-bg border theme-border rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-black text-primary">Match SEO (Dynamic Through API)</h1>
        <p className="text-sm text-secondary mt-1">These templates feed your match metadata + schema.</p>
      </div>

      <div className="theme-bg border theme-border rounded-xl p-6 space-y-5">
        <div className="text-xs font-black uppercase tracking-widest text-secondary">Templates</div>

        <Field label="Title Template" value={titleTemplate} onChange={setTitleTemplate} />
        <TextArea label="Description Template" value={descriptionTemplate} onChange={setDescriptionTemplate} />
        <Field label="H1 Template" value={h1Template} onChange={setH1Template} />

        <div className="pt-2 border-t theme-border" />

        <div className="text-xs font-black uppercase tracking-widest text-secondary">Schema</div>
        <div className="flex items-center gap-3">
          <input
            id="autoSchema"
            type="checkbox"
            checked={autoSchema}
            onChange={(e) => setAutoSchema(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="autoSchema" className="text-sm text-secondary">
            Auto-generate schema (SportsEvent + teams + score)
          </label>
        </div>

        <div className="pt-2 border-t theme-border" />

        <div className="text-xs font-black uppercase tracking-widest text-secondary">OG Image</div>

        <div className="flex items-center gap-3">
          <input
            id="dynBanner"
            type="checkbox"
            checked={useDynamicBanner}
            onChange={(e) => setUseDynamicBanner(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="dynBanner" className="text-sm text-secondary">
            Use dynamic banner
          </label>
        </div>

        <Field label="Dynamic Banner Path" value={bannerPath} onChange={setBannerPath} />
        <Field label="Fallback OG Image" value={fallbackOg} onChange={setFallbackOg} />

        <div className="pt-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#0f80da] disabled:opacity-60 text-white font-bold uppercase tracking-wide text-xs hover:opacity-95"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase tracking-wide text-secondary">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg theme-bg border theme-border text-primary outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase tracking-wide text-secondary">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 rounded-lg theme-bg border theme-border text-primary outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}
