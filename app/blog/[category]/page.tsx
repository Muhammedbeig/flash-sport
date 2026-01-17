import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60;

const PAGE_SIZE = 10;

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

function pageHref(category: string, page: number) {
  const base = `/blog/${encodeURIComponent(category)}`;
  return page <= 1 ? base : `${base}?page=${page}`;
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category } = await params;
  const sp = await searchParams;
  const page = parsePage(sp);
  const skip = (page - 1) * PAGE_SIZE;

  const cat = await prisma.blogCategory.findUnique({
    where: { slug: category },
    select: { id: true, name: true, slug: true },
  });

  if (!cat) notFound();

  const where = { isPublished: true, deletedAt: null as any, categoryId: cat.id };

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
        publishedAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

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
      <div className="text-sm text-secondary">
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>{" "}
        / {cat.name}
      </div>

      <div className="mb-8 mt-2">
        <h1 className="text-3xl font-bold text-primary">{cat.name}</h1>
        <p className="text-secondary mt-2">All posts in this category.</p>
      </div>

      <div className="space-y-4">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${encodeURIComponent(cat.slug)}/${encodeURIComponent(p.slug)}`}
            className="block rounded-2xl theme-border border theme-bg p-5 hover:opacity-[0.98] transition"
          >
            <div className="text-xs text-secondary">
              {formatDate(p.publishedAt ?? p.updatedAt)}
            </div>
            <div className="mt-2 text-lg md:text-xl font-bold text-primary">{p.title}</div>
            {p.excerpt ? <p className="mt-2 text-sm text-secondary">{p.excerpt}</p> : null}
          </Link>
        ))}

        {!posts.length ? (
          <div className="rounded-2xl theme-border border theme-bg p-6 text-secondary">
            No posts found in this category.
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
            href={hasPrev ? pageHref(cat.slug, safePage - 1) : "#"}
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
                href={pageHref(cat.slug, 1)}
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
              href={pageHref(cat.slug, p)}
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
                href={pageHref(cat.slug, totalPages)}
                className="px-3 py-2 rounded-xl theme-border border theme-bg text-sm hover:opacity-95"
              >
                {totalPages}
              </Link>
            </>
          ) : null}

          <Link
            href={hasNext ? pageHref(cat.slug, safePage + 1) : "#"}
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
