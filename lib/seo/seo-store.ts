// lib/seo/seo-store.ts
import { cache } from "react";
import { SEO_STORE_DEFAULT, SeoStore } from "./seo-central";

/**
 * Later (admin panel):
 * - replace this with DB read / API read
 * - keep the same function signature, no routing files need edits
 */
export const getSeoStore = cache(async (): Promise<SeoStore> => {
  // Optional: allow overriding from an env JSON (instant “admin-like” control)
  const raw = process.env.SEO_CONFIG_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return { ...SEO_STORE_DEFAULT, ...parsed };
    } catch {
      // ignore invalid JSON, keep defaults
    }
  }
  return SEO_STORE_DEFAULT;
});
