import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60;

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;

  const t = await prisma.blogTag.findUnique({
    where: { slug: tag },
    select: { name: true, slug: true },
  });

  if (!t) notFound();

  const posts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      deletedAt: null,
      tags: { some: { slug: t.slug } },
    },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 50,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { slug: true } },
    },
  });

  return (
    <main className="container mx-auto px-6 max-w-5xl py-10">
      <div className="text-sm text-secondary">
        <Link href="/blog" className="hover:underline">Blog</Link> / Tag / {t.name}
      </div>

      <h1 className="text-3xl font-bold mt-2">#{t.name}</h1>

      <div className="mt-8 space-y-4">
        {posts.map((p) => {
          const categorySlug = p.category?.slug || "uncategorized";
          const href = `/blog/${encodeURIComponent(categorySlug)}/${encodeURIComponent(p.slug)}`;

          return (
            <Link
              key={p.id}
              href={href}
              className="block rounded-2xl theme-border border theme-bg p-5 hover:opacity-95 transition"
            >
              <div className="text-xs text-secondary">
                {(p.publishedAt ?? p.updatedAt).toISOString().slice(0, 10)}
              </div>
              <div className="mt-1 text-lg font-bold text-primary">{p.title}</div>
              {p.excerpt ? <p className="mt-2 text-sm text-secondary">{p.excerpt}</p> : null}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
