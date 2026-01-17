// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { prisma } from "@/lib/db/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getPage(slug: string) {
  noStore();

  // Only serve published pages publicly
  return prisma.page.findFirst({
    where: { slug, isPublished: true },
    select: {
      title: true,
      slug: true,
      content: true,
      metaTitle: true,
      metaDescription: true,
      updatedAt: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) return {};

  const title = page.metaTitle?.trim() || page.title;
  const description = page.metaDescription?.trim() || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function PublicDbPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-in fade-in">
      <h1 className="text-4xl font-black text-primary mb-6">{page.title}</h1>

      {/* PageEditor stores HTML in page.content */}
      <div
        className="prose prose-slate dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content || "" }}
      />
    </div>
  );
}
