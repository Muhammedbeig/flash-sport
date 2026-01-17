import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESERVED = new Set([
  "contact",
  "privacy-policy",
  "terms-of-service",
  "blog",
  "faqs",
]);

export async function GET() {
  const rows = await prisma.page.findMany({
    where: { isPublished: true },
    select: { title: true, slug: true, updatedAt: true },
    orderBy: { title: "asc" },
  });

  const pages = rows
    .filter((p) => p.slug && !RESERVED.has(p.slug))
    .map((p) => ({
      label: p.title,
      url: `/${p.slug}`,
      updatedAt: p.updatedAt,
    }));

  return NextResponse.json(
    { ok: true, pages },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
