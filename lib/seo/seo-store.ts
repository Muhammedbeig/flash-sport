// lib/seo/seo-store.ts
import { cache } from "react";
import { SEO_STORE_DEFAULT, type SeoStore } from "./seo-central";

declare global {
  // eslint-disable-next-line no-var
  var __SEO_STORE_RUNTIME__: SeoStore | undefined;
}

/** ✅ Sync read (used by resolver so changes apply immediately in the same node runtime) */
export function getSeoStoreSync(): SeoStore {
  // 1) Runtime edits from admin
  if (globalThis.__SEO_STORE_RUNTIME__) return globalThis.__SEO_STORE_RUNTIME__;

  // 2) Optional env JSON override (useful on Vercel as a quick override)
  const raw = process.env.SEO_CONFIG_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<SeoStore>;
      return deepMerge(SEO_STORE_DEFAULT, parsed);
    } catch {
      // ignore
    }
  }

  // 3) Defaults
  return SEO_STORE_DEFAULT;
}

/** ✅ Sync write (used by API route) */
export function setSeoStoreSync(next: SeoStore) {
  globalThis.__SEO_STORE_RUNTIME__ = next;
}

/** ✅ Async getter (kept for future DB usage) */
export const getSeoStore = cache(async (): Promise<SeoStore> => {
  return getSeoStoreSync();
});

/** ✅ Patch helper (deep merge) */
export function patchSeoStore(patch: Partial<SeoStore>): SeoStore {
  const current = getSeoStoreSync();
  const next = deepMerge(current, patch);
  setSeoStoreSync(next);
  return next;
}

/* ---------------- helpers ---------------- */

function isObject(v: any): v is Record<string, any> {
  return v && typeof v === "object" && !Array.isArray(v);
}

function deepMerge<T>(base: T, patch: any): T {
  if (!isObject(base) || !isObject(patch)) return (patch ?? base) as T;

  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };

  for (const k of Object.keys(patch)) {
    const bv = (base as any)[k];
    const pv = patch[k];

    if (Array.isArray(bv) && Array.isArray(pv)) {
      out[k] = pv; // replace arrays
    } else if (isObject(bv) && isObject(pv)) {
      out[k] = deepMerge(bv, pv);
    } else {
      out[k] = pv;
    }
  }

  return out as T;
}
