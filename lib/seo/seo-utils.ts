// lib/seo/seo-utils.ts

export const SEO_LIMITS = {
  titleMax: 60,
  descriptionMax: 155,
};

export function normalizeWhitespace(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function truncate(s: string, max: number) {
  const text = normalizeWhitespace(s);
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return (lastSpace > 40 ? sliced.slice(0, lastSpace) : sliced).trimEnd() + "…";
}

export function fillTemplate(template: string, vars: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
}
