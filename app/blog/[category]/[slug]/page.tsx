import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60;

function resolveImg(src?: string | null) {
  if (!src) return null;
  const s = String(src).trim();
  if (!s) return null;
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("data:")) return s;
  return s.startsWith("/") ? s : `/${s}`;
}

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      metaTitle: true,
      metaDescription: true,
      ogTitle: true,
      ogDescription: true,
      ogImage: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  const title = post.metaTitle || post.ogTitle || post.title;
  const description = post.metaDescription || post.ogDescription || post.excerpt || "";

  const ogImage = resolveImg(post.ogImage) || resolveImg(post.featuredImage) || undefined;

  return {
    title,
    description,
    openGraph: {
      title: post.ogTitle || title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: "article",
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const post = await getPost(slug);
  if (!post) notFound();

  const realCategory = post.category?.slug || "uncategorized";
  if (category !== realCategory) {
    redirect(`/blog/${encodeURIComponent(realCategory)}/${encodeURIComponent(post.slug)}`);
  }

  const heroImg = resolveImg(post.featuredImage);

  return (
    <main className="container mx-auto px-6 max-w-3xl py-10">
      <div className="text-sm text-secondary">
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        {post.category?.slug ? (
          <>
            {" "}
            /{" "}
            <Link href={`/blog/${encodeURIComponent(post.category.slug)}`} className="hover:underline">
              {post.category.name}
            </Link>
          </>
        ) : null}
      </div>

      <h1 className="text-3xl font-bold mt-3">{post.title}</h1>

      <div className="mt-3 text-xs text-secondary flex flex-wrap gap-2">
        <span>{(post.publishedAt ?? post.updatedAt).toISOString().slice(0, 10)}</span>
        {post.author?.name ? <span>• By {post.author.name}</span> : null}
      </div>

      {post.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link
              key={t.slug}
              href={`/blog/tag/${encodeURIComponent(t.slug)}`}
              className="text-xs px-3 py-1 rounded-full theme-border border theme-bg hover:opacity-95"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      ) : null}

      {heroImg ? (
        <div className="mt-8 overflow-hidden rounded-2xl theme-border border bg-black/5 dark:bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImg}
            alt={post.title}
            className="w-full h-auto object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      ) : null}

      <article
        className="mt-8 prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  );
}
