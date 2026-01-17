"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      const ref = document.referrer || "";
      const refUrl = ref ? new URL(ref) : null;

      const payload = {
        linkUrl: pathname || "/",
        sourceSlug: refUrl?.pathname || "(direct)",
        sourceTitle: ref || "(direct)",
        statusCode: 404,
      };

      const body = JSON.stringify(payload);

      // Prefer beacon
      const ok = navigator.sendBeacon?.("/api/public/broken-link", body);
      if (!ok) {
        fetch("/api/public/broken-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you’re looking for doesn’t exist or may have been moved.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white">
          Go Home
        </Link>
      </div>
    </div>
  );
}
