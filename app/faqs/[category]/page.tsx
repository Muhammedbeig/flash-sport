import Link from "next/link";
import { notFound } from "next/navigation";
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

export default async function FAQCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  const cat = await prisma.fAQCategory.findUnique({
    where: { slug: category },
    select: { id: true, name: true, slug: true },
  });

  if (!cat) notFound();

  const faqs = await prisma.fAQ.findMany({
    where: { isPublished: true, categoryId: cat.id },
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
  });

  const jsonLdItems = faqs.slice(0, 50).map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: stripHtml(f.answer).slice(0, 2000) },
  }));

  return (
    <main className="container mx-auto px-6 max-w-4xl py-10">
      <div className="text-sm text-secondary">
        <Link href="/faqs" className="hover:underline">
          Knowledge Base
        </Link>{" "}
        / {cat.name}
      </div>

      <div className="mb-8 mt-2">
        <h1 className="text-3xl font-bold text-primary">{cat.name}</h1>
        <p className="text-secondary mt-2">Browse all FAQs in this category.</p>
      </div>

      {jsonLdItems.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: jsonLdItems,
            }),
          }}
        />
      ) : null}

      <div className="rounded-2xl theme-border border theme-bg overflow-hidden">
        {!faqs.length ? (
          <div className="p-6 text-secondary">No FAQs published in this category yet.</div>
        ) : (
          <div className="divide-y theme-border">
            {faqs.map((f) => (
              <details key={f.id} className="group">
                <summary className="cursor-pointer list-none p-5 hover:bg-black/5 dark:hover:bg-white/5 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-primary font-semibold">{f.question}</div>
                    <div className="text-secondary text-xs pt-1 group-open:rotate-180 transition">⌄</div>
                  </div>

                  <div className="mt-2">
                    <Link
                      href={`/faqs/${encodeURIComponent(cat.slug)}/${encodeURIComponent(f.slug)}`}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open page →
                    </Link>
                  </div>
                </summary>

                <div
                  className="px-5 pb-5 text-sm text-secondary leading-relaxed prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeBasic(f.answer) }}
                />
              </details>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
