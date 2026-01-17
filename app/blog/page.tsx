import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60;

const PAGE_SIZE = 10;

function resolveImg(src?: string | null) {
  if (!src) return null;
  const s = String(src).trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  return s.startsWith("/") ? s : `/${s}`;
}

function parsePage(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.page;
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function pageHref(page: number) {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = (page - 1) * PAGE_SIZE;

  const where = { isPublished: true, deletedAt: null as any };

  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  // If user asks for page too high, clamp by redirecting to last valid page
  if (page !== safePage) {
    // no hard redirect (keeps things simple) — just use clamped page for rendering
  }

  const pagesToShow = (() => {
    const window = 2;
    const start = Math.max(1, safePage - window);
    const end = Math.min(totalPages, safePage + window);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  })();

  return (
    <main className="container mx-auto px-6 max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Blog</h1>
        <p className="text-secondary mt-2">Latest updates, product news, and sports insights.</p>
      </div>

      <div className="space-y-5">
        {posts.map((p) => {
          const catSlug = p.category?.slug || "uncategorized";
          const href = `/blog/${encodeURIComponent(catSlug)}/${encodeURIComponent(p.slug)}`;
          const img = resolveImg(p.featuredImage);
          const date = formatDate(p.publishedAt ?? p.updatedAt);

          return (
            <Link
              key={p.id}
              href={href}
              className="block rounded-2xl theme-border border theme-bg hover:opacity-[0.98] transition overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[260px] w-full">
                  {img ? (
                    <div className="w-full aspect-[16/9] md:aspect-[4/3] bg-black/5 dark:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/9] md:aspect-[4/3] bg-black/5 dark:bg-white/5" />
                  )}
                </div>

                <div className="flex-1 p-5 md:p-6">
                  <div className="flex items-center gap-2 text-xs text-secondary">
                    <span className="inline-flex items-center rounded-full px-3 py-1 theme-border border theme-bg">
                      {p.category?.name ?? "Uncategorized"}
                    </span>
                    <span>•</span>
                    <span>{date}</span>
                  </div>

                  <h2 className="mt-3 text-xl md:text-2xl font-bold text-primary leading-snug">
                    {p.title}
                  </h2>

                  {p.excerpt ? (
                    <p className="mt-3 text-sm md:text-base text-secondary leading-relaxed">
                      {p.excerpt}
                    </p>
                  ) : null}

                  <div className="mt-4 text-sm font-semibold text-primary hover:underline underline-offset-4 decoration-blue-600/30">
                    Read article →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {!posts.length ? (
          <div className="rounded-2xl theme-border border theme-bg p-6 text-secondary">
            No posts published yet.
          </div>
        ) : null}
      </div>

      {/* Pagination */}
      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-xs text-secondary">
          Page <span className="text-primary font-semibold">{safePage}</span> of{" "}
          <span className="text-primary font-semibold">{totalPages}</span> • {total} posts
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={hasPrev ? pageHref(safePage - 1) : "#"}
            aria-disabled={!hasPrev}
            className={`px-3 py-2 rounded-xl theme-border border theme-bg text-sm ${
              hasPrev ? "hover:opacity-95" : "opacity-50 pointer-events-none"
            }`}
          >
            ← Prev
          </Link>

          {safePage > 3 ? (
            <>
              <Link
                href={pageHref(1)}
                className="px-3 py-2 rounded-xl theme-border border theme-bg text-sm hover:opacity-95"
              >
                1
              </Link>
              <span className="px-2 text-secondary">…</span>
            </>
          ) : null}

          {pagesToShow.map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`px-3 py-2 rounded-xl theme-border border text-sm ${
                p === safePage ? "bg-blue-600 text-white border-blue-600" : "theme-bg hover:opacity-95"
              }`}
            >
              {p}
            </Link>
          ))}

          {safePage < totalPages - 2 ? (
            <>
              <span className="px-2 text-secondary">…</span>
              <Link
                href={pageHref(totalPages)}
                className="px-3 py-2 rounded-xl theme-border border theme-bg text-sm hover:opacity-95"
              >
                {totalPages}
              </Link>
            </>
          ) : null}

          <Link
            href={hasNext ? pageHref(safePage + 1) : "#"}
            aria-disabled={!hasNext}
            className={`px-3 py-2 rounded-xl theme-border border theme-bg text-sm ${
              hasNext ? "hover:opacity-95" : "opacity-50 pointer-events-none"
            }`}
          >
            Next →
          </Link>
        </div>
      </div>
    </main>
  );
}
