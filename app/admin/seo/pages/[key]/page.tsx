"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSeoStore, patchSeoStore } from "@/lib/admin/seo-admin-client";
import type { SeoEntry } from "@/lib/seo/seo-central";

type RobotIndex = "index" | "noindex";
type RobotFollow = "follow" | "nofollow";

function ensureLeadingSlash(v: string) {
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return v.startsWith("/") ? v : `/${v}`;
}

export default function SeoPageEditor({ params }: { params: { key: string } }) {
  const pageKey = decodeURIComponent(params.key);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // REQUIRED
  const [titleTag, setTitleTag] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [h1Title, setH1Title] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [ogTitle, setOgTitle] = useState("");
  const [ogDescription, setOgDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // ADVANCED
  const [jsonLdText, setJsonLdText] = useState<string>("{}");
  const [robotsIndex, setRobotsIndex] = useState<RobotIndex>("index");
  const [robotsFollow, setRobotsFollow] = useState<RobotFollow>("follow");

  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; url: string }>>([{ name: "Home", url: "/" }]);
  const [internalLinks, setInternalLinks] = useState<Array<{ label: string; href: string }>>([]);
  const [imageAlts, setImageAlts] = useState<Array<{ src: string; alt: string }>>([{ src: "", alt: "" }]);

  const [headerScripts, setHeaderScripts] = useState("");
  const [footerScripts, setFooterScripts] = useState("");

  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const store = await fetchSeoStore();
        if (!alive) return;

        const entry = (store.pages?.[pageKey] || null) as SeoEntry | null;

        setTitleTag(entry?.title || "");
        setMetaDescription(entry?.description || "");
        setH1Title(entry?.h1 || "");

        const canon = entry?.canonical || "";
        setSlug(canon.startsWith("/") ? canon.slice(1) : canon.replace(/^\/+/, ""));

        setCanonicalUrl(entry?.canonical || "");
        setFocusKeyword(entry?.primaryKeyword || "");

        setOgTitle(entry?.ogTitle || "");
        setOgDescription(entry?.ogDescription || "");
        setOgImageUrl(entry?.ogImage || "");

        setRobotsIndex(entry?.robots?.index === false ? "noindex" : "index");
        setRobotsFollow(entry?.robots?.follow === false ? "nofollow" : "follow");

        setBreadcrumbs(entry?.breadcrumbs?.length ? entry.breadcrumbs : [{ name: "Home", url: "/" }]);
        setInternalLinks(entry?.internalLinks || []);
        setImageAlts(entry?.imageAlts?.length ? entry.imageAlts : [{ src: "", alt: "" }]);

        setHeaderScripts(entry?.headerScripts || "");
        setFooterScripts(entry?.footerScripts || "");

        setJsonLdText(JSON.stringify(entry?.jsonLd || {}, null, 2));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [pageKey]);

  const validateJson = () => {
    try {
      JSON.parse(jsonLdText || "{}");
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e?.message || "Invalid JSON");
    }
  };

  const patchKey = useMemo(
    () =>
      JSON.stringify({
        pageKey,
        titleTag,
        metaDescription,
        slug,
        h1Title,
        canonicalUrl,
        focusKeyword,
        ogTitle,
        ogDescription,
        ogImageUrl,
        jsonLdText,
        robotsIndex,
        robotsFollow,
        breadcrumbs,
        internalLinks,
        imageAlts,
        headerScripts,
        footerScripts,
      }),
    [
      pageKey,
      titleTag,
      metaDescription,
      slug,
      h1Title,
      canonicalUrl,
      focusKeyword,
      ogTitle,
      ogDescription,
      ogImageUrl,
      jsonLdText,
      robotsIndex,
      robotsFollow,
      breadcrumbs,
      internalLinks,
      imageAlts,
      headerScripts,
      footerScripts,
    ]
  );

  const onSave = async () => {
    setSaving(true);
    try {
      const jsonLd = JSON.parse(jsonLdText || "{}");

      const nextEntry: SeoEntry = {
        title: titleTag,
        description: metaDescription,
        h1: h1Title,

        primaryKeyword: focusKeyword || undefined,

        canonical: canonicalUrl?.trim()
          ? ensureLeadingSlash(canonicalUrl.trim())
          : slug?.trim()
          ? ensureLeadingSlash(slug.trim())
          : undefined,

        ogTitle: ogTitle || undefined,
        ogDescription: ogDescription || undefined,
        ogImage: ogImageUrl || undefined,

        robots: {
          index: robotsIndex === "index",
          follow: robotsFollow === "follow",
        },

        breadcrumbs: breadcrumbs?.length ? breadcrumbs : undefined,
        internalLinks: internalLinks?.length ? internalLinks : undefined,
        imageAlts: imageAlts?.length ? imageAlts : undefined,

        headerScripts: headerScripts || undefined,
        footerScripts: footerScripts || undefined,

        jsonLd: jsonLd && typeof jsonLd === "object" ? jsonLd : undefined,
      };

      await patchSeoStore({
        pages: {
          [pageKey]: nextEntry,
        },
      } as any);
    } catch (e: any) {
      setJsonError(e?.message || "Save failed");
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
        <h1 className="text-2xl font-black text-primary">Edit SEO</h1>
        <p className="text-sm text-secondary mt-1">
          Page key: <span className="font-semibold text-primary">{pageKey}</span>
        </p>
      </div>

      <Card>
        <SectionTitle>Required Fields</SectionTitle>

        <Field label="Title Tag" value={titleTag} onChange={setTitleTag} placeholder="Custom title" />
        <TextArea
          label="Meta Description"
          value={metaDescription}
          onChange={setMetaDescription}
          placeholder="Custom description"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Slug (user-editable)" value={slug} onChange={setSlug} placeholder="e.g. contact" />
          <Field label="H1 Title" value={h1Title} onChange={setH1Title} placeholder="Main heading" />
        </div>

        <Field label="Canonical URL (optional)" value={canonicalUrl} onChange={setCanonicalUrl} placeholder="/contact or https://..." />
        <Field label="Focus Keyword" value={focusKeyword} onChange={setFocusKeyword} placeholder="For analysis" />

        <Divider />

        <SectionTitle>Open Graph</SectionTitle>
        <Field label="OG Title" value={ogTitle} onChange={setOgTitle} placeholder="For social media" />
        <TextArea
          label="OG Description"
          value={ogDescription}
          onChange={setOgDescription}
          placeholder="Social description"
        />
        <Field label="OG Image Upload (URL for now)" value={ogImageUrl} onChange={setOgImageUrl} placeholder="/og.png or https://..." />

        <Actions onSave={onSave} saving={saving} key={patchKey} />
      </Card>

      <Card>
        <SectionTitle>Advanced Fields</SectionTitle>

        <Divider />

        <SectionTitle>Robots Meta Tag</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="index / noindex" value={robotsIndex} onChange={(v) => setRobotsIndex(v as RobotIndex)} options={["index", "noindex"]} />
          <Select label="follow / nofollow" value={robotsFollow} onChange={(v) => setRobotsFollow(v as RobotFollow)} options={["follow", "nofollow"]} />
        </div>

        <Divider />

        <SectionTitle>JSON-LD Schema Editor</SectionTitle>
        <TextArea label="Schema JSON" value={jsonLdText} onChange={setJsonLdText} rows={10} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={validateJson}
            className="px-3 py-2 rounded-lg border theme-border text-xs font-bold uppercase tracking-wide text-secondary hover:text-primary"
          >
            Validate JSON
          </button>
          {jsonError ? <span className="text-xs text-red-500">{jsonError}</span> : <span className="text-xs text-secondary">OK</span>}
        </div>

        <Divider />

        <SectionTitle>Breadcrumb Builder</SectionTitle>
        <div className="space-y-3">
          {breadcrumbs.map((b, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label={`Crumb ${idx + 1} Name`}
                value={b.name}
                onChange={(v) => setBreadcrumbs((prev) => prev.map((x, i) => (i === idx ? { ...x, name: v } : x)))}
              />
              <Field
                label={`Crumb ${idx + 1} URL`}
                value={b.url}
                onChange={(v) => setBreadcrumbs((prev) => prev.map((x, i) => (i === idx ? { ...x, url: v } : x)))}
              />
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBreadcrumbs((p) => [...p, { name: "", url: "" }])}
              className="px-3 py-2 rounded-lg border theme-border text-xs font-bold uppercase tracking-wide text-secondary hover:text-primary"
            >
              Add crumb
            </button>
            <button
              type="button"
              onClick={() => setBreadcrumbs((p) => (p.length > 1 ? p.slice(0, -1) : p))}
              className="px-3 py-2 rounded-lg border theme-border text-xs font-bold uppercase tracking-wide text-secondary hover:text-primary"
            >
              Remove last
            </button>
          </div>
        </div>

        <Divider />

        <SectionTitle>Internal Linking Section</SectionTitle>
        <div className="space-y-2">
          {internalLinks.map((l, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label={`Link ${idx + 1} Label`}
                value={l.label}
                onChange={(v) => setInternalLinks((prev) => prev.map((x, i) => (i === idx ? { ...x, label: v } : x)))}
              />
              <Field
                label={`Link ${idx + 1} Href`}
                value={l.href}
                onChange={(v) => setInternalLinks((prev) => prev.map((x, i) => (i === idx ? { ...x, href: v } : x)))}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setInternalLinks((p) => [...p, { label: "", href: "" }])}
              className="px-3 py-2 rounded-lg border theme-border text-xs font-bold uppercase tracking-wide text-secondary hover:text-primary"
            >
              Add link
            </button>
            <button
              type="button"
              onClick={() => setInternalLinks((p) => (p.length > 0 ? p.slice(0, -1) : p))}
              className="px-3 py-2 rounded-lg border theme-border text-xs font-bold uppercase tracking-wide text-secondary hover:text-primary"
            >
              Remove last
            </button>
          </div>
        </div>

        <Divider />

        <SectionTitle>Image Alt Text Editor</SectionTitle>
        <div className="space-y-3">
          {imageAlts.map((img, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label={`Image ${idx + 1} URL`}
                value={img.src}
                onChange={(v) => setImageAlts((prev) => prev.map((x, i) => (i === idx ? { ...x, src: v } : x)))}
              />
              <Field
                label={`Image ${idx + 1} Alt`}
                value={img.alt}
                onChange={(v) => setImageAlts((prev) => prev.map((x, i) => (i === idx ? { ...x, alt: v } : x)))}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImageAlts((p) => [...p, { src: "", alt: "" }])}
              className="px-3 py-2 rounded-lg border theme-border text-xs font-bold uppercase tracking-wide text-secondary hover:text-primary"
            >
              Add image
            </button>
            <button
              type="button"
              onClick={() => setImageAlts((p) => (p.length > 1 ? p.slice(0, -1) : p))}
              className="px-3 py-2 rounded-lg border theme-border text-xs font-bold uppercase tracking-wide text-secondary hover:text-primary"
            >
              Remove last
            </button>
          </div>
        </div>

        <Divider />

        <SectionTitle>Custom Header Scripts</SectionTitle>
        <TextArea label="Header scripts" value={headerScripts} onChange={setHeaderScripts} rows={6} />

        <SectionTitle>Custom Footer Scripts</SectionTitle>
        <TextArea label="Footer scripts" value={footerScripts} onChange={setFooterScripts} rows={6} />

        <Actions onSave={onSave} saving={saving} />
      </Card>
    </div>
  );
}

/* UI helpers */
function Card({ children }: { children: React.ReactNode }) {
  return <div className="theme-bg border theme-border rounded-xl p-6 space-y-5">{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-black uppercase tracking-widest text-secondary">{children}</div>;
}
function Divider() {
  return <div className="pt-2 border-t theme-border" />;
}
function Actions({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-[#0f80da] disabled:opacity-60 text-white font-bold uppercase tracking-wide text-xs hover:opacity-95"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase tracking-wide text-secondary">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg theme-bg border theme-border text-primary placeholder:text-secondary/70 outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}

// ✅ FIX: placeholder is now supported
function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase tracking-wide text-secondary">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg theme-bg border theme-border text-primary placeholder:text-secondary/70 outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </div>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-black uppercase tracking-wide text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg theme-bg border theme-border text-primary outline-none focus:ring-2 focus:ring-blue-500/30"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
