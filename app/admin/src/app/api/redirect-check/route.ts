import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");

  if (!path) return NextResponse.json({ redirect: null });

  try {
    const redirect = await prisma.redirect.findUnique({
      where: { source: path },
    });

    if (redirect && redirect.isActive) {
      // Async update hit counter (fire and forget)
      prisma.redirect
        .update({
          where: { id: redirect.id },
          data: { hits: { increment: 1 } },
        })
        .catch(console.error);

      return NextResponse.json({ redirect });
    }
  } catch (error) {
    console.error("Redirect check failed", error);
  }

  return NextResponse.json({ redirect: null });
}
