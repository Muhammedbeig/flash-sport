// app/api/public/seo-brand/route.ts
import { NextResponse } from "next/server";
import { getSeoStoreSync } from "@/lib/seo/seo-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const store: any = getSeoStoreSync();

  const brand = store?.brand || {};
  const labels = store?.labels || {};
  const header = store?.header || {};
  const footer = store?.footer || {};

  const payload = {
    siteName: brand.siteName || "Live Score",
    logoTitle: brand.logoTitle || brand.siteName || "Live Score",
    // ✅ brand.logoUrl is optional; Header.tsx falls back to /brand/logo.svg anyway
    logoUrl: brand.logoUrl || "/brand/logo.svg",
    tagline: brand.tagline || "",
    siteUrl: brand.siteUrl || "https://livesoccerr.com",

    // ✅ what Header.tsx already reads
    sportLabels: labels?.sportLabels || {},

    // ✅ NEW: admin-controlled header + footer settings
    header,
    footer,
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
