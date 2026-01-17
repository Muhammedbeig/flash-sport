const DEFAULT_ADMIN_BASE = "/admin";

const rawBase = (process.env.NEXT_PUBLIC_ADMIN_BASE_PATH ?? DEFAULT_ADMIN_BASE).trim();
const normalizedBase = rawBase === "/" ? "" : rawBase.replace(/\/+$/, "");

function splitPathSuffix(path: string) {
  const match = path.match(/^[^?#]*/);
  const base = match ? match[0] : path;
  const suffix = path.slice(base.length);
  return { base, suffix };
}

function ensureLeadingSlash(path: string) {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export const adminBasePath = normalizedBase;

export function withAdminBase(path: string) {
  if (!path) return adminBasePath || "/";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(path)) return path;

  const { base, suffix } = splitPathSuffix(path);
  const cleanBase = ensureLeadingSlash(base);

  if (!adminBasePath) return `${cleanBase}${suffix}`;
  if (cleanBase === adminBasePath || cleanBase.startsWith(`${adminBasePath}/`)) {
    return `${cleanBase}${suffix}`;
  }

  return `${adminBasePath}${cleanBase}${suffix}`;
}

export function stripAdminBase(path: string | null | undefined) {
  if (!path) return path || "";
  if (!adminBasePath) return path;
  if (path === adminBasePath) return "/";
  if (path.startsWith(`${adminBasePath}/`)) {
    const next = path.slice(adminBasePath.length);
    return next || "/";
  }
  return path;
}
