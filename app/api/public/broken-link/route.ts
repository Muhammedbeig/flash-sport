import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const linkUrl = String(body?.linkUrl || "").slice(0, 2048);
    const sourceSlug = String(body?.sourceSlug || "(direct)").slice(0, 255);
    const sourceTitle = String(body?.sourceTitle || "(unknown)").slice(0, 255);
    const statusCode = Number(body?.statusCode || 404);

    if (!linkUrl) {
      return NextResponse.json({ ok: false, error: "linkUrl required" }, { status: 400 });
    }

    await prisma.brokenLink.create({
      data: { linkUrl, sourceSlug, sourceTitle, statusCode },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }
}
