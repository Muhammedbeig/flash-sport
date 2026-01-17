// app/admin/src/app/api/admin/media/unused/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/guard";
import { Role } from "@prisma/client";
import path from "path";
import fs from "fs";
import { unlink } from "fs/promises";

const publicDir = () => path.join(process.cwd(), "public");

function normalizeLocalUrl(input?: string | null) {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  // absolute URL -> keep pathname
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      return u.pathname;
    } catch {
      return null;
    }
  }

  if (s.startsWith("/")) return s.split("?")[0].split("#")[0];
  if (/^(uploads|images)\//i.test(s)) return `/${s.split("?")[0].split("#")[0]}`;
  return null;
}

function extractUploadUrlsFromText(text?: string | null) {
  const out: string[] = [];
  const s = String(text || "");
  if (!s) return out;

  // collect local urls like /uploads/... or /images/... inside html/markdown/css
  const re = /(\/(?:uploads|images)\/[^"'<> )]+)(?=[\s"'<>)]|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) out.push(m[1]);

  return out;
}

function addUsedUrl(raw: any, usedUrls: Set<string>) {
  if (typeof raw !== "string") return;
  const direct = normalizeLocalUrl(raw);
  if (direct) usedUrls.add(direct);
  for (const u of extractUploadUrlsFromText(raw)) usedUrls.add(u);
}

function collectLocalUrlsFromUnknown(input: any, usedUrls: Set<string>, depth = 0) {
  if (input === null || input === undefined) return;
  if (depth > 6) return;

  if (typeof input === "string") {
    addUsedUrl(input, usedUrls);
    return;
  }

  if (Array.isArray(input)) {
    for (const item of input) collectLocalUrlsFromUnknown(item, usedUrls, depth + 1);
    return;
  }

  if (typeof input === "object") {
    for (const value of Object.values(input)) {
      collectLocalUrlsFromUnknown(value, usedUrls, depth + 1);
    }
  }
}

function readJsonIfExists(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function safeAbsFromUrl(urlPath: string) {
  const clean = urlPath.replace(/^\/+/, "");
  if (!clean || clean.includes("..")) return null;
  return path.join(publicDir(), clean);
}

export async function GET() {
  const auth = await requireRole([Role.ADMIN, Role.EDITOR]);
  if ("response" in auth) return auth.response;

  try {
    const allMedia = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });

    const usedUrls = new Set<string>();

    const [
      posts,
      pages,
      faqs,
      seoPages,
      seoGlobals,
      seoMatches,
      seoLeagues,
      seoPlayers,
      systemSetting,
      webSetting,
      users,
    ] = await Promise.all([
      prisma.blogPost.findMany({ select: { featuredImage: true, ogImage: true, content: true } }),
      prisma.page.findMany({ select: { content: true } }),
      prisma.fAQ.findMany({ select: { answer: true } }),
      prisma.seoPage.findMany({ select: { data: true } }),
      prisma.seoGlobal.findMany({ select: { data: true } }),
      prisma.seoMatch.findMany({ select: { data: true } }),
      prisma.seoLeague.findMany({ select: { data: true } }),
      prisma.seoPlayer.findMany({ select: { data: true } }),
      prisma.systemSetting.findFirst({ select: { logo: true, favicon: true } }),
      prisma.webSetting.findFirst({ select: { headerLogo: true, footerLogo: true, placeholderImage: true } }),
      prisma.user.findMany({ select: { image: true } }),
    ]);

    for (const p of posts) collectLocalUrlsFromUnknown(p, usedUrls);
    for (const p of pages) collectLocalUrlsFromUnknown(p, usedUrls);
    for (const f of faqs) collectLocalUrlsFromUnknown(f, usedUrls);
    for (const p of seoPages) collectLocalUrlsFromUnknown(p.data, usedUrls);
    for (const g of seoGlobals) collectLocalUrlsFromUnknown(g.data, usedUrls);
    for (const m of seoMatches) collectLocalUrlsFromUnknown(m.data, usedUrls);
    for (const l of seoLeagues) collectLocalUrlsFromUnknown(l.data, usedUrls);
    for (const p of seoPlayers) collectLocalUrlsFromUnknown(p.data, usedUrls);
    if (systemSetting) collectLocalUrlsFromUnknown(systemSetting, usedUrls);
    if (webSetting) collectLocalUrlsFromUnknown(webSetting, usedUrls);
    for (const u of users) collectLocalUrlsFromUnknown(u, usedUrls);

    const seoConfigDir = path.join(process.cwd(), "seo-config");
    if (fs.existsSync(seoConfigDir)) {
      const seoFiles = [
        "seo-store.global.json",
        "seo-store.match.json",
        "seo-store.league.json",
        "seo-store.player.json",
        "seo-page.contact.json",
        "seo-page.privacy-policy.json",
        "seo-page.terms-of-service.json",
      ];
      for (const file of seoFiles) {
        const data = readJsonIfExists(path.join(seoConfigDir, file));
        if (data) collectLocalUrlsFromUnknown(data, usedUrls);
      }
    }

    const unusedMedia = allMedia.filter((m) => !usedUrls.has(m.url));
    const totalSize = unusedMedia.reduce((acc, curr) => acc + (curr.size || 0), 0);

    return NextResponse.json({ ok: true, media: unusedMedia, totalSize });
  } catch (error) {
    console.error("Unused Media Fetch Error:", error);
    return NextResponse.json({ ok: false, error: "Failed to scan media" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await requireRole([Role.ADMIN]);
  if ("response" in auth) return auth.response;

  try {
    const { ids } = await req.json();

    const files = await prisma.media.findMany({
      where: { id: { in: ids } },
      select: { id: true, url: true },
    });

    for (const file of files) {
      try {
        const abs = safeAbsFromUrl(file.url);
        if (abs && fs.existsSync(abs)) await unlink(abs);
      } catch (e) {
        console.error(`Failed to delete file: ${file.url}`, e);
      }
    }

    await prisma.media.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to delete files" }, { status: 500 });
  }
}
