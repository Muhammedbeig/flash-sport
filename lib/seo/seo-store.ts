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

  // arrays: patch wins
  if (Array.isArray(base) && Array.isArray(patch)) return patch as T;

  // objects: recursive merge
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

  // primitive: patch wins
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

function signatureForFiles(paths: string[]): string {
  const parts: string[] = [];
  for (const p of paths) {
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

/**
 * Sync store (JSON/defaults only)
 * - runtime patch wins
 * - SEO_CONFIG_JSON env wins
 * - edge returns defaults
 * - otherwise loads from disk (memoized)
 */
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
/* -------------------------------------------------------------------------- */
/* DB OVERRIDE (Prisma)                                                       */
/* -------------------------------------------------------------------------- */

const SEO_DB_OVERRIDE_ENABLED = (process.env.SEO_DB_OVERRIDE ?? "1") === "1";

/**
 * IMPORTANT:
 * If you keep React/cache() or long-lived memo, DB updates may not appear.
 * This gives a short TTL so changes show quickly without restarting server.
 *
 * Set SEO_DB_CACHE_MS=0 in dev if you want always-fresh.
 */
const SEO_DB_CACHE_MS = Number(process.env.SEO_DB_CACHE_MS ?? "500");

const KEY_GLOBAL = process.env.SEO_DB_KEY_GLOBAL ?? "livesoccerr";
const KEY_MATCH = process.env.SEO_DB_KEY_MATCH ?? "livesoccerr_match";
const KEY_LEAGUE = process.env.SEO_DB_KEY_LEAGUE ?? "livesoccerr_league";
const KEY_PLAYER = process.env.SEO_DB_KEY_PLAYER ?? "livesoccerr_player";

function uniqKeys(keys: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const k of keys.map((x) => (x || "").trim()).filter(Boolean)) {
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

function normalizeAssetPath(v?: any) {
  if (typeof v !== "string") return v;
  const s = v.trim();
  if (!s) return s;

  // already absolute URL
  if (/^https?:\/\//i.test(s)) return s;

  // ensure leading slash so it doesn't become route-relative
  if (!s.startsWith("/")) return `/${s}`;
  return s;
}

let dbMemo:
  | { patch: Partial<SeoStore> | null; sig: string; at: number }
  | null = null;

async function findFirstByKeys<T extends { key: string; updatedAt: Date; data: any }>(
  prismaModel: any,
  keys: string[]
): Promise<T | null> {
  for (const k of keys) {
    const row = await prismaModel.findUnique({ where: { key: k } });
    if (row) return row as T;
  }
  return null;
}

async function loadStorePatchFromDb(): Promise<Partial<SeoStore> | null> {
  // Respect existing priority rules
  if ((globalThis as any).__SEO_STORE_RUNTIME__) return null;
  if (process.env.SEO_CONFIG_JSON) return null;
  if (isEdgeRuntime()) return null;
  if (!SEO_DB_OVERRIDE_ENABLED) return null;

  const now = Date.now();
  if (dbMemo && SEO_DB_CACHE_MS > 0 && now - dbMemo.at < SEO_DB_CACHE_MS) {
    return dbMemo.patch;
  }

  try {
    // dynamic import keeps edge bundles clean
    const { prisma } = await import("@/lib/db/prisma");

    // Key fallbacks (covers old setups or mismatched admin keys)
    const globalKeys = uniqKeys([KEY_GLOBAL, "global", "default", "livesoccerr"]);
    const matchKeys = uniqKeys([KEY_MATCH, "match", "default", "livesoccerr_match"]);
    const leagueKeys = uniqKeys([KEY_LEAGUE, "league", "default", "livesoccerr_league"]);
    const playerKeys = uniqKeys([KEY_PLAYER, "player", "default", "livesoccerr_player"]);

    const [g, m, l, p] = await Promise.all([
      findFirstByKeys(prisma.seoGlobal, globalKeys),
      findFirstByKeys(prisma.seoMatch, matchKeys),
      findFirstByKeys(prisma.seoLeague, leagueKeys),
      findFirstByKeys(prisma.seoPlayer, playerKeys),
    ]);

    // signature = last updated timestamps so memo refreshes quickly after saves
    const sig = [
      g ? `${g.key}:${g.updatedAt.getTime()}` : "g:none",
      m ? `${m.key}:${m.updatedAt.getTime()}` : "m:none",
      l ? `${l.key}:${l.updatedAt.getTime()}` : "l:none",
      p ? `${p.key}:${p.updatedAt.getTime()}` : "p:none",
    ].join("|");

    if (dbMemo && dbMemo.sig === sig && SEO_DB_CACHE_MS > 0 && now - dbMemo.at < SEO_DB_CACHE_MS) {
      return dbMemo.patch;
    }

    // IMPORTANT: merge at ROOT (DB JSON matches store shape)
    let patch: any = {};
    if (g?.data) patch = deepMerge(patch, g.data as any);
    if (m?.data) patch = deepMerge(patch, m.data as any);
    if (l?.data) patch = deepMerge(patch, l.data as any);
    if (p?.data) patch = deepMerge(patch, p.data as any);

    // Normalize asset paths (fixes logo path issues like "brand/logo.svg")
    if (patch?.brand) {
      patch.brand.logoUrl = normalizeAssetPath(patch.brand.logoUrl);
      patch.brand.defaultOgImage = normalizeAssetPath(patch.brand.defaultOgImage);
    }
    if (patch?.home) {
      patch.home.ogImage = normalizeAssetPath(patch.home.ogImage);
    }
    if (patch?.match?.og) {
      patch.match.og.fallbackImage = normalizeAssetPath(patch.match.og.fallbackImage);
      patch.match.og.bannerPath = normalizeAssetPath(patch.match.og.bannerPath);
    }
    if (patch?.league?.og) {
      patch.league.og.fallbackImage = normalizeAssetPath(patch.league.og.fallbackImage);
    }
    if (patch?.player?.og) {
      patch.player.og.fallbackImage = normalizeAssetPath(patch.player.og.fallbackImage);
    }

    const finalPatch =
      patch && typeof patch === "object" && Object.keys(patch).length > 0
        ? (patch as Partial<SeoStore>)
        : null;

    dbMemo = { patch: finalPatch, sig, at: now };
    return finalPatch;
  } catch (err) {
    console.error("[SEO] Failed to load DB override patch:", err);
    dbMemo = { patch: null, sig: "error", at: Date.now() };
    return null;
  }
}

/**
 * Async store (DB overrides JSON/defaults)
 * Use this in resolvers/builders/routes.
 */
export async function getSeoStore(): Promise<SeoStore> {
  const base = getSeoStoreSync(); // JSON/default store
  const dbPatch = await loadStorePatchFromDb();
  if (!dbPatch) return base;
  return deepMerge(base, dbPatch) as SeoStore;
}
