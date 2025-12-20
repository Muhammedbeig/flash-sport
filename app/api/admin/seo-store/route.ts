// app/api/admin/seo-store/route.ts
import { NextResponse } from "next/server";
import { getSeoStoreSync, patchSeoStore } from "@/lib/seo/seo-store";
import type { SeoStore } from "@/lib/seo/seo-central";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getSeoStoreSync());
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<SeoStore> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const next = patchSeoStore(body);
  return NextResponse.json(next);
}
