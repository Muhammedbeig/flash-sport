// app/api/public/pages/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noCacheJson(payload: any, status = 200) {
  const res = NextResponse.json(payload, { status });
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      where: { isPublished: true },
      orderBy: { title: "asc" },
      select: { title: true, slug: true },
    });

    return noCacheJson({ ok: true, pages });
  } catch (e) {
    console.error("[API Error] GET /api/public/pages:", e);
    return noCacheJson({ ok: false, error: "Internal Server Error" }, 500);
  }
}
