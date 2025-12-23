// lib/seo/seo-store.ts
import { cache } from "react";
import fs from "node:fs";
import path from "node:path";
import { SEO_STORE_DEFAULT, type SeoStore } from "./seo-central";

declare global {
  // eslint-disable-next-line no-var
  var __SEO_STORE_RUNTIME__: SeoStore | undefined;
}

const STORE_FILES = [
  "seo-store.global.json",
  "seo-store.match.json",
  "seo-store.league.json",
  "seo-store.player.json",
] as const;

const LEGAL_FILES: Array<{ file: string; key: "privacyPolicy" | "termsOfService" | "contact" }> = [
  { file: "seo-page.privacy-policy.json", key: "privacyPolicy" },
  { file: "seo-page.terms-of-service.json", key: "termsOfService" },
  { file: "seo-page.contact.json", key: "contact" },
];

const CACHE_MS = 1000;

let memo: { store: SeoStore; sig: string; at: number; dir: string } | null = null;

function isEdgeRuntime() {
  return process.env.NEXT_RUNTIME === "edge";
}

function isObject(v: any) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepMerge<T>(base: T, patch: any): T {
  if (!patch) return base;

  if (Array.isArray(base) && Array.isArray(patch)) return patch as T;

  if (isObject(base) && isObject(patch)) {
    const out: any = { ...(base as any) };
    for (const k of Object.keys(patch)) {
      const bv = (base as any)[k];
      const pv = patch[k];

      if (Array.isArray(bv) && Array.isArray(pv)) out[k] = pv;
      else if (isObject(bv) && isObject(pv)) out[k] = deepMerge(bv, pv);
      else out[k] = pv;
    }
    return out as T;
  }

  return patch as T;
}

function readJsonIfExists(filePath: string): any | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function signatureForFiles(filePaths: string[]): string {
  const parts: string[] = [];
  for (const p of filePaths) {
    try {
      const st = fs.statSync(p);
      parts.push(`${p}:${st.size}:${st.mtimeMs}`);
    } catch {
      parts.push(`${p}:missing`);
    }
  }
  return parts.join("|");
}

function resolveCandidateDirs(): string[] {
  const cwd = process.cwd();

  const envRaw = (process.env.SEO_STORE_DIR || "").trim();
  const envDir = envRaw
    ? path.isAbsolute(envRaw)
      ? envRaw
      : path.join(cwd, envRaw)
    : null;

  // Priority order:
  // 1) SEO_STORE_DIR (if set)
  // 2) ./seo-config (recommended)
  // 3) ./seo
  // 4) project root
  return [envDir, path.join(cwd, "seo-config"), path.join(cwd, "seo"), cwd].filter(
    (x): x is string => !!x
  );
}

function pickStoreDir(): string {
  const dirs = resolveCandidateDirs();
  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;

      const hasAny =
        STORE_FILES.some((f) => fs.existsSync(path.join(dir, f))) ||
        LEGAL_FILES.some((x) => fs.existsSync(path.join(dir, x.file)));

      if (hasAny) return dir;
    } catch {
      // ignore and continue
    }
  }

  // If nothing found, still default to seo-config so deployments remain consistent.
  return (process.env.SEO_STORE_DIR || path.join(process.cwd(), "seo-config")).trim();
}

function loadStorePatchFromDisk(dir: string): any {
  let merged: any = {};
  for (const file of STORE_FILES) {
    const p = path.join(dir, file);
    const data = readJsonIfExists(p);
    if (data) merged = deepMerge(merged, data);
  }
  return merged;
}

function injectLegalSeo(store: SeoStore, dir: string): SeoStore {
  const next: any = { ...store, pages: { ...(store.pages || {}) } };

  for (const f of LEGAL_FILES) {
    const doc = readJsonIfExists(path.join(dir, f.file));
    const seo = doc?.seo;
    if (seo && typeof seo === "object") {
      next.pages[f.key] = deepMerge(next.pages[f.key] || {}, seo);
    }
  }

  return next as SeoStore;
}

export function getSeoStoreSync(): SeoStore {
  // 1) runtime patch (admin API can set this later)
  if (globalThis.__SEO_STORE_RUNTIME__) return globalThis.__SEO_STORE_RUNTIME__;

  // 2) env override (emergency)
  const raw = process.env.SEO_CONFIG_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<SeoStore>;
      return deepMerge(SEO_STORE_DEFAULT, parsed);
    } catch {
      // ignore
    }
  }

  // 3) Edge: cannot rely on fs
  if (isEdgeRuntime()) return SEO_STORE_DEFAULT;

  const dir = pickStoreDir();
  const watchPaths = [
    ...STORE_FILES.map((f) => path.join(dir, f)),
    ...LEGAL_FILES.map((x) => path.join(dir, x.file)),
  ];

  const sig = signatureForFiles(watchPaths);
  const now = Date.now();

  if (memo && memo.dir === dir && memo.sig === sig && now - memo.at < CACHE_MS) return memo.store;

  const patch = loadStorePatchFromDisk(dir);
  let store = deepMerge(SEO_STORE_DEFAULT, patch);
  store = injectLegalSeo(store, dir);

  memo = { store, sig, at: now, dir };
  return store;
}

export function setSeoStoreSync(next: SeoStore) {
  globalThis.__SEO_STORE_RUNTIME__ = next;
}

export const getSeoStore = cache(async (): Promise<SeoStore> => getSeoStoreSync());

export function patchSeoStore(patch: Partial<SeoStore>): SeoStore {
  const current = getSeoStoreSync();
  const next = deepMerge(current, patch);
  setSeoStoreSync(next);
  return next;
}
