"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, RefreshCcw, UploadCloud, XCircle } from "lucide-react";
import { fetchSeoStore, patchSeoStore } from "@/lib/admin/seo-admin-client";

type SeoStore = any;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function AdminGlobalSeoSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [store, setStore] = useState<SeoStore | null>(null);

  // brand fields
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [titlePrefix, setTitlePrefix] = useState("");
  const [titleSuffix, setTitleSuffix] = useState("");
  const [defaultOgImage, setDefaultOgImage] = useState("");
  const [defaultMetaDescription, setDefaultMetaDescription] = useState("");

  // match auto rules
  const [matchTitlePattern, setMatchTitlePattern] = useState("");
  const [matchDescriptionPattern, setMatchDescriptionPattern] = useState("");
  const [matchSchemaEnabled, setMatchSchemaEnabled] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    setSaved(null);

    const json = await fetchSeoStore();
    setStore(json);

    const b = json.brand || {};
    setSiteName(b.siteName || "");
    setSiteUrl(b.siteUrl || "");
    setLogoUrl(b.logoUrl || "/brand/logo.svg");
    setTitlePrefix(b.titlePrefix || "");
    setTitleSuffix(b.titleSuffix || "");
    setDefaultOgImage(b.defaultOgImage || "/og.png");
    setDefaultMetaDescription(b.defaultMetaDescription || "");

    const m = json.match || {};
    setMatchTitlePattern(m.titlePatterns?.[0] || "");
    setMatchDescriptionPattern(m.descriptionPattern || "");
    setMatchSchemaEnabled(!!m.schema?.enabled);

    setLoading(false);
  }

  useEffect(() => {
    load().catch((e) => {
      setError(e?.message || "Failed to load");
      setLoading(false);
    });
  }, []);

  const preview = useMemo(() => {
    const vars: Record<string, string> = {
      home: "Team A",
      away: "Team B",
      brand: siteName || "LiveSocceRR",
      sport: "football",
      id: "12345",
    };

    const title = (matchTitlePattern || "").replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    const desc = (matchDescriptionPattern || "").replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
    return { title, desc };
  }, [matchTitlePattern, matchDescriptionPattern, siteName]);

  async function onSave() {
    if (!store) return;

    setSaving(true);
    setSaved(null);
    setError(null);

    try {
      const patch = {
        brand: {
          siteName,
          siteUrl,
          logoUrl, // ✅ includes uploaded dataURL
          titlePrefix,
          titleSuffix,
          defaultOgImage,
          defaultMetaDescription,
        },
        match: {
          ...store.match,
          titlePatterns: [
            matchTitlePattern,
            ...(Array.isArray(store.match?.titlePatterns) ? store.match.titlePatterns.slice(1) : []),
          ],
          descriptionPattern: matchDescriptionPattern,
          schema: { ...(store.match?.schema || {}), enabled: matchSchemaEnabled },
        },
      };

      const next = await patchSeoStore(patch);
      setStore(next);

      setSaved("Saved ✅ (applied immediately)");
      setTimeout(() => setSaved(null), 2500);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onLogoFileChange(file: File | null) {
    if (!file) return;
    setError(null);

    // simple size guard (keeps runtime store safe)
    if (file.size > 500_000) {
      setError("Logo too large. Please use an image under 500KB (SVG/PNG preferred).");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setLogoUrl(dataUrl); // ✅ instant preview + save to store
      setSaved("Logo loaded (remember to Save)");
      setTimeout(() => setSaved(null), 2500);
    } catch {
      setError("Failed to read logo file.");
    }
  }

  const input =
    "w-full rounded-lg theme-bg border theme-border px-3 py-2 text-sm text-primary placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500/40";
  const label = "text-xs font-bold uppercase tracking-widest text-secondary";
  const help = "text-xs text-secondary mt-1";

  if (loading) {
    return (
      <div className="theme-bg border theme-border rounded-xl p-6">
        <div className="text-sm text-secondary">Loading Global Settings…</div>
        {error ? <div className="mt-2 text-xs text-red-500">{error}</div> : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="theme-bg border theme-border rounded-xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-primary">Global SEO Settings</h1>
            <p className="text-sm text-secondary mt-1">
              These settings apply site-wide (defaults + match auto-generation).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => load()}
              className="px-3 py-2 rounded-lg border theme-border text-sm text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Reload
            </button>

            <button
              onClick={onSave}
              disabled={saving}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-[#0f80da] text-white hover:opacity-95 disabled:opacity-60 flex items-center gap-2"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {saved ? <div className="mt-3 text-sm text-primary">{saved}</div> : null}
        {error ? <div className="mt-2 text-xs text-red-500">{error}</div> : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BRANDING */}
        <div className="theme-bg border theme-border rounded-xl p-6 space-y-4">
          <div className="text-sm font-bold text-primary">Branding</div>

          <div>
            <div className={label}>Website name</div>
            <input className={input} value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>

          <div>
            <div className={label}>Website URL</div>
            <input className={input} value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://livesoccerr.com" />
            <div className={help}>Used for canonical URLs + OG URLs.</div>
          </div>

          {/* ✅ LOGO UPLOAD */}
          <div className="space-y-2">
            <div className={label}>Site logo</div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl border theme-border theme-bg flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl || "/brand/logo.svg"} alt="Logo preview" className="w-8 h-8 object-contain" />
              </div>

              <label className="px-3 py-2 rounded-lg border theme-border text-sm text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer">
                <UploadCloud size={16} />
                Upload
                <input
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={(e) => onLogoFileChange(e.target.files?.[0] || null)}
                />
              </label>

              <button
                type="button"
                onClick={() => setLogoUrl("/brand/logo.svg")}
                className="px-3 py-2 rounded-lg border theme-border text-sm text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
              >
                <XCircle size={16} />
                Reset
              </button>
            </div>

            <div className={help}>
              Upload stores as DataURL for now (instant apply). Later you can replace with a hosted URL (Firebase Storage / CDN).
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-secondary">Or paste logo URL</div>
              <input
                className={input}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="/brand/logo.svg or https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className={label}>Title prefix</div>
              <input className={input} value={titlePrefix} onChange={(e) => setTitlePrefix(e.target.value)} placeholder="LIVE: " />
            </div>
            <div>
              <div className={label}>Title suffix</div>
              <input className={input} value={titleSuffix} onChange={(e) => setTitleSuffix(e.target.value)} placeholder=" | LiveSocceRR" />
            </div>
          </div>
        </div>

        {/* DEFAULTS */}
        <div className="theme-bg border theme-border rounded-xl p-6 space-y-4">
          <div className="text-sm font-bold text-primary">Defaults</div>

          <div>
            <div className={label}>Default OG image</div>
            <input className={input} value={defaultOgImage} onChange={(e) => setDefaultOgImage(e.target.value)} placeholder="/og.png" />
          </div>

          <div>
            <div className={label}>Default meta description</div>
            <textarea
              className={`${input} min-h-[110px]`}
              value={defaultMetaDescription}
              onChange={(e) => setDefaultMetaDescription(e.target.value)}
              placeholder="Used when a page has no description."
            />
          </div>
        </div>

        {/* AUTO RULES */}
        <div className="theme-bg border theme-border rounded-xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-primary">Auto-generation rules (Match pages)</div>
              <div className="text-xs text-secondary mt-1">
                Placeholders: {"{home}"} {"{away}"} {"{brand}"} {"{sport}"} {"{id}"}
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-primary">
              <input type="checkbox" checked={matchSchemaEnabled} onChange={(e) => setMatchSchemaEnabled(e.target.checked)} />
              Auto-generate schema (SportsEvent)
            </label>
          </div>

          <div>
            <div className={label}>Auto-generate title pattern</div>
            <input className={input} value={matchTitlePattern} onChange={(e) => setMatchTitlePattern(e.target.value)} />
          </div>

          <div>
            <div className={label}>Auto-generate description pattern</div>
            <textarea
              className={`${input} min-h-[90px]`}
              value={matchDescriptionPattern}
              onChange={(e) => setMatchDescriptionPattern(e.target.value)}
            />
          </div>

          <div className="border theme-border rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-secondary">Preview</div>
            <div className="mt-2 text-sm text-primary font-semibold">{preview.title || "—"}</div>
            <div className="mt-1 text-xs text-secondary">{preview.desc || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
