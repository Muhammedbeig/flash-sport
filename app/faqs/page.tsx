import Link from "next/link";
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

function parseSearch(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.q;
  const v = Array.isArray(raw) ? raw[0] : raw;
  return (v || "").trim();
}

export default async function FAQsHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = parseSearch(sp);

  const categories = await prisma.fAQCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const faqs = await prisma.fAQ.findMany({
    where: {
      isPublished: true,
      ...(q ? { OR: [{ question: { contains: q } }, { answer: { contains: q } }] } : {}),
    },
    include: { category: true },
    orderBy: [{ order: "asc" }, { updatedAt: "desc" }],
  });

  const grouped = new Map<
    string,
    { categoryName: string; categorySlug: string; items: typeof faqs }
  >();

  for (const f of faqs) {
    const catSlug = f.category?.slug || "uncategorized";
    const catName = f.category?.name || "Uncategorized";
    if (!grouped.has(catSlug)) grouped.set(catSlug, { categoryName: catName, categorySlug: catSlug, items: [] as any });
    grouped.get(catSlug)!.items.push(f);
  }

  const orderedGroups = [
    ...categories
      .map((c) => grouped.get(c.slug))
      .filter(Boolean) as Array<{ categoryName: string; categorySlug: string; items: typeof faqs }>,
    ...(grouped.has("uncategorized") ? [grouped.get("uncategorized")!] : []),
  ];

  const jsonLdItems = faqs.slice(0, 25).map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: stripHtml(f.answer).slice(0, 2000) },
  }));

  return (
    <main className="container mx-auto px-6 max-w-6xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Knowledge Base</h1>
        <p className="text-secondary mt-2">Find answers quickly — categorized and searchable.</p>
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

      <form action="/faqs" method="GET" className="mb-8">
        <div className="flex gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search FAQs (e.g. live scores, account, ads...)"
            className="flex-1 px-4 py-3 rounded-xl theme-bg theme-border border text-primary outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button className="px-5 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition">
            Search
          </button>
        </div>
        {q ? (
          <div className="mt-2 text-xs text-secondary">
            Showing results for <span className="text-primary font-semibold">“{q}”</span> —{" "}
            <Link href="/faqs" className="text-blue-600 dark:text-blue-400 hover:underline">
              clear
            </Link>
          </div>
        ) : null}
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="rounded-2xl theme-border border theme-bg p-4">
            <div className="text-xs font-black text-secondary uppercase tracking-widest mb-3">Categories</div>

            <div className="space-y-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/faqs/${encodeURIComponent(c.slug)}`}
                  className="block px-3 py-2 rounded-xl theme-border border theme-bg hover:opacity-95 transition text-sm font-semibold text-primary"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-3 space-y-6">
          {orderedGroups.length === 0 ? (
            <div className="rounded-2xl theme-border border theme-bg p-6 text-secondary">No FAQs found.</div>
          ) : (
            orderedGroups.map((group) => (
              <div key={group.categorySlug} className="rounded-2xl theme-border border theme-bg overflow-hidden">
                <div className="p-5 border-b theme-border">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-primary">{group.categoryName}</h2>
                    <Link
                      href={`/faqs/${encodeURIComponent(group.categorySlug)}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View category →
                    </Link>
                  </div>
                </div>

                <div className="divide-y theme-border">
                  {group.items.map((f) => (
                    <details key={f.id} className="group">
                      <summary className="cursor-pointer list-none p-5 hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-primary font-semibold">{f.question}</div>
                          <div className="text-secondary text-xs pt-1 group-open:rotate-180 transition">⌄</div>
                        </div>

                        {/* ✅ No onClick. Just a normal link below summary */}
                        <div className="mt-2">
                          <Link
                            href={`/faqs/${encodeURIComponent(group.categorySlug)}/${encodeURIComponent(f.slug)}`}
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
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
