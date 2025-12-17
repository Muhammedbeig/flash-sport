// app/privacy-policy/page.tsx
import { SITE_CONTENT, applyVars, getContentVars, type LegalBlock } from "@/lib/site-content";

function RenderBlock({ block, vars }: { block: LegalBlock; vars: Record<string, string> }) {
  if (block.type === "h3") {
    return <h3 className="font-bold text-primary">{applyVars(block.text, vars)}</h3>;
  }

  if (block.type === "p") {
    // Auto-mail link styling if the paragraph contains the email
    const text = applyVars(block.text, vars);
    const email = vars.supportEmail;

    if (email && text.includes(email)) {
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
    return <p>{text}</p>;
  }

  if (block.type === "ul") {
    return (
      <ul className="list-disc pl-5 space-y-2">
        {block.items.map((it, idx) => (
          <li key={idx}>{applyVars(it, vars)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "p_rich") {
    return (
      <p>
        {block.inlines.map((x, idx) => {
          if (x.type === "text") return <span key={idx}>{applyVars(x.value, vars)}</span>;
          return (
            <a
              key={idx}
              href={x.href}
              className="text-blue-600 hover:underline font-bold"
            >
              {x.label}
            </a>
          );
        })}
      </p>
    );
  }

  return null;
}

export default function PrivacyPolicyPage() {
  const vars = getContentVars();
  const doc = SITE_CONTENT.legal.privacyPolicy;

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
                {applyVars(section.title, vars)}
              </h2>

              <div className="space-y-4">
                {section.blocks.map((block, bIdx) => (
                  <RenderBlock key={bIdx} block={block} vars={vars} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
