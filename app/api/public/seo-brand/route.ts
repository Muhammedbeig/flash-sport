// app/api/public/seo-brand/route.ts
import { NextResponse } from "next/server";
import { getSeoStoreSync } from "@/lib/seo/seo-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { brand } = getSeoStoreSync();
  return NextResponse.json({
    siteName: brand.siteName,
    siteUrl: brand.siteUrl,
    logoUrl: brand.logoUrl,
    logoTitle: brand.logoTitle,
  });
}
