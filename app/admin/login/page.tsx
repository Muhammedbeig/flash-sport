"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { useAdminAuth } from "@/components/admin/auth/AdminAuthProvider";

function normalizePath(p: string) {
  const x = (p || "").replace(/\/+$/, "");
  return x === "" ? "/" : x;
}

function isSafeInternalPath(v: string) {
  return v.startsWith("/") && !v.startsWith("//") && !v.includes("://");
}

function decodeFewTimes(v: string) {
  let cur = v;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(cur);
      if (next === cur) break;
      cur = next;
    } catch {
      break;
    }
  }
  return cur;
}

export default function AdminLoginPage() {
  const { user, loading, signInEmail } = useAdminAuth();
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = normalizePath(usePathname());

  // subdomain mode => /login, dashboard /
  // legacy path mode => /admin/login, dashboard /admin
  const fallbackNext = pathname.startsWith("/admin") ? "/admin" : "/";

  const next = useMemo(() => {
    const raw = sp.get("next");
    if (!raw) return fallbackNext;

    const decoded = decodeFewTimes(raw);

    // Prevent recursive "next=/login?next=..."
    if (decoded.includes("/login") && decoded.includes("next=")) return fallbackNext;

    if (!isSafeInternalPath(decoded)) return fallbackNext;

    // If subdomain mode, strip /admin from old links
    if (fallbackNext === "/" && (decoded === "/admin" || decoded.startsWith("/admin/"))) {
      return decoded.replace(/^\/admin/, "") || "/";
    }

    return decoded;
  }, [sp, fallbackNext]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace(next);
  }, [user, loading, router, next]);

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await signInEmail(email.trim(), password);
      router.replace(next);
    } catch (error: any) {
      setErr(error?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-0px)] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="theme-bg border theme-border rounded-xl shadow-sm p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black text-primary">Admin Login</h1>
            <p className="text-sm text-secondary mt-1">Sign in to continue.</p>
          </div>

          {err ? (
            <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
              <div className="text-xs text-red-700 dark:text-red-300">{err}</div>
            </div>
          ) : null}

          <form onSubmit={onEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-secondary">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@yourdomain.com"
                className="w-full px-3 py-2 rounded-lg theme-bg border theme-border text-primary placeholder:text-secondary/70 outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wide text-secondary">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg theme-bg border theme-border text-primary placeholder:text-secondary/70 outline-none focus:ring-2 focus:ring-blue-500/30"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 rounded-lg bg-[#0f80da] text-white font-bold uppercase tracking-wide text-xs hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
