// app/api/public/seo-brand/route.ts
import { NextResponse } from "next/server";
import { getSeoStore } from "@/lib/seo/seo-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const store: any = await getSeoStore();

  const brand = store?.brand || {};
  const labels = store?.labels || {};
  const header = store?.header || {};
  const footer = store?.footer || {};

  return NextResponse.json(
    {
      siteName: brand.siteName || "Live Score",
      logoTitle: brand.logoTitle || brand.siteName || "Live Score",
      logoUrl: brand.logoUrl || "/brand/logo.svg",
      tagline: brand.tagline || "",
      siteUrl: brand.siteUrl || "https://livesoccerr.com",
      faviconUrl: brand.faviconUrl || "/favicon.ico",
      themeColor: brand.themeColor || undefined,

      sportLabels: labels?.sportLabels || {},
      header,
      footer,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
