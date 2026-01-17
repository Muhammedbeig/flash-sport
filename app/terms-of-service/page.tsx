// app/terms-of-service/page.tsx
import Link from "next/link";
import { readStaticPageContent, type LegalBlock } from "@/lib/seo/static-page-content";

function linkEmails(text: string) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (!match) return <p>{text}</p>;

  const email = match[0];
  const parts = text.split(email);

  return (
    <p>
      {parts[0]}
      <a href={`mailto:${email}`} className="text-blue-600 hover:underline font-bold">
        {email}
      </a>
      {parts.slice(1).join(email)}
    </p>
  );
}

function RenderBlock({ block }: { block: LegalBlock }) {
  if (block.type === "h3") {
    return <h3 className="font-bold text-primary">{block.text}</h3>;
  }

  if (block.type === "p") {
    return linkEmails(block.text);
  }

  if (block.type === "ul") {
    return (
      <ul className="list-disc pl-5 space-y-2">
        {block.items.map((it, idx) => (
          <li key={idx}>{it}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "p_rich") {
    return (
      <p>
        {block.inlines.map((x, idx) => {
          if (x.type === "text") return <span key={idx}>{x.value}</span>;

          // keep your old behavior: use Link for internal paths, <a> for external
          const isInternal = x.href?.startsWith("/");
          if (isInternal) {
            return (
              <Link key={idx} href={x.href} className="text-blue-600 hover:underline font-bold">
                {x.label}
              </Link>
            );
          }

          return (
            <a key={idx} href={x.href} className="text-blue-600 hover:underline font-bold">
              {x.label}
            </a>
          );
        })}
      </p>
    );
  }

  return null;
}

export default async function TermsOfServicePage() {
  const page = await readStaticPageContent("terms-of-service");
  const doc = page.content;

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight mb-2">
            {doc.h1}
          </h1>
          <p className="text-sm text-secondary">Last updated: {doc.lastUpdated}</p>
        </div>

        {/* Content Card */}
        <div className="theme-bg theme-border border rounded-xl p-6 md:p-10 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-secondary">
          {doc.sections.map((section, sIdx) => (
            <section key={sIdx} className="space-y-4">
              <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
                {section.title}
              </h2>

              <div className="space-y-4">
                {section.blocks.map((block, bIdx) => (
                  <RenderBlock key={bIdx} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
