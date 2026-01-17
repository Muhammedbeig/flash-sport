import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeBasic(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*')/gi, "");
}

async function getFAQBySlug(slug: string) {
  return prisma.fAQ.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const faq = await getFAQBySlug(slug);

  if (!faq || !faq.isPublished) return {};

  const title = faq.question;
  const description = stripHtml(faq.answer).slice(0, 160);

  return { title, description };
}

export default async function FAQDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;

  const faq = await getFAQBySlug(slug);
  if (!faq || !faq.isPublished) notFound();

  const realCategory = faq.category?.slug || "uncategorized";
  if (category !== realCategory) {
    redirect(`/faqs/${encodeURIComponent(realCategory)}/${encodeURIComponent(faq.slug)}`);
  }

  // Related FAQs
  const related =
    faq.categoryId != null
      ? await prisma.fAQ.findMany({
          where: { isPublished: true, categoryId: faq.categoryId, id: { not: faq.id } },
          orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
          take: 8,
          select: { question: true, slug: true },
        })
      : [];

  // JSON-LD (single question page as FAQPage with one entity)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: stripHtml(faq.answer).slice(0, 2000),
        },
      },
    ],
  };

  return (
    <main className="container mx-auto px-6 max-w-3xl py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="text-sm text-secondary">
        <Link href="/faqs" className="hover:underline">
          Knowledge Base
        </Link>
        {faq.category?.slug ? (
          <>
            {" "}
            /{" "}
            <Link href={`/faqs/${encodeURIComponent(faq.category.slug)}`} className="hover:underline">
              {faq.category.name}
            </Link>
          </>
        ) : null}
      </div>

      <h1 className="mt-3 text-3xl font-bold text-primary">{faq.question}</h1>

      <div
        className="mt-6 rounded-2xl theme-border border theme-bg p-6 prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeBasic(faq.answer) }}
      />

      {related.length ? (
        <div className="mt-10">
          <div className="text-xs font-black text-secondary uppercase tracking-widest mb-3">
            Related questions
          </div>

          <div className="rounded-2xl theme-border border theme-bg overflow-hidden divide-y theme-border">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/faqs/${encodeURIComponent(realCategory)}/${encodeURIComponent(r.slug)}`}
                className="block p-4 hover:bg-black/5 dark:hover:bg-white/5 transition text-primary font-semibold"
              >
                {r.question}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
