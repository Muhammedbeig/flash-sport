// app/contact/page.tsx
import { Mail, ArrowRight, Info, Phone, MapPin, Clock } from "lucide-react";
import { readStaticPageContent, type LegalBlock } from "@/lib/seo/static-page-content";

function RenderBlock({ block }: { block: LegalBlock }) {
  if (block.type === "h3") return <h3 className="font-bold text-primary">{block.text}</h3>;

  if (block.type === "p") return <p>{block.text}</p>;

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

export default async function ContactPage() {
  const pageJson = await readStaticPageContent("contact");
  const content = pageJson.content;

  const details = content.contactDetails || {};

  // ✅ FIX: admin uses contactDetails.supportEmail + whatsapp
  const email =
    details.supportEmail ||
    details.email ||
    content.supportEmail ||
    content.email ||
    "service@livesoccerr.com";

  const phone =
    details.whatsapp ||
    details.phone ||
    content.whatsapp ||
    content.phone ||
    "";

  const supportHours =
    details.supportHours ||
    content.supportHours ||
    "";

  const address1 =
    details.addressLine1 ||
    content.addressLine1 ||
    (details.address?.[0] ?? "") ||
    "";

  const address2 =
    details.addressLine2 ||
    content.addressLine2 ||
    (details.address?.[1] ?? "") ||
    "";

  const h1 = content.h1 || "Contact";
  const intro = content.intro || [];

  const cardTitle = content.cardTitle || "Email Support";
  const cardSubtitle = content.cardSubtitle || "Send us an email and we’ll respond as soon as possible.";
  const note =
    content.note ||
    "For faster support, include the sport, league, match/player link, and screenshots if relevant.";

  const sections = content.sections || [];

  return (
    <div className="w-full min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">{h1}</h1>

          <div className="prose dark:prose-invert max-w-none text-secondary text-sm md:text-base leading-relaxed">
            {intro.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </div>

        {/* Email Action Card */}
        <div className="theme-bg theme-border border rounded-2xl p-8 md:p-12 shadow-xl text-center flex flex-col items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500" />

          <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
            <Mail size={32} className="text-blue-600 dark:text-blue-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">{cardTitle}</h2>
            <p className="text-secondary text-sm">{cardSubtitle}</p>
          </div>

          <a
            href={`mailto:${email}`}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
          >
            <span>{email}</span>
            <ArrowRight size={18} />
          </a>

          {/* Optional Contact Details */}
          <div className="w-full max-w-md grid grid-cols-1 gap-3 pt-2">
            {phone && (
              <a
                href={`tel:${phone}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/10 text-secondary text-xs font-bold hover:opacity-90"
              >
                <Phone size={16} className="shrink-0" />
                <span>{phone}</span>
              </a>
            )}

            {supportHours && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/10 text-secondary text-xs font-bold">
                <Clock size={16} className="shrink-0" />
                <span>{supportHours}</span>
              </div>
            )}

            {(address1 || address2) && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-secondary/10 text-secondary text-xs font-bold">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>
                  {address1}
                  {address2 ? (
                    <>
                      <br />
                      {address2}
                    </>
                  ) : null}
                </span>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="mt-4 flex items-start gap-3 text-xs text-secondary bg-secondary/10 rounded-xl p-4 max-w-md">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p className="text-left">{note}</p>
          </div>
        </div>

        {/* Optional Sections from Admin */}
        {sections.length > 0 ? (
          <div className="mt-8 theme-bg theme-border border rounded-2xl p-6 md:p-8 shadow-sm space-y-8 text-sm md:text-base leading-relaxed text-secondary">
            {sections.map((section: any, sIdx: number) => (
              <section key={sIdx} className="space-y-4">
                {section.title ? (
                  <h2 className="text-xl font-bold text-primary uppercase tracking-wide border-b theme-border pb-2">
                    {section.title}
                  </h2>
                ) : null}

                <div className="space-y-4">
                  {(section.blocks || []).map((block: LegalBlock, bIdx: number) => (
                    <RenderBlock key={bIdx} block={block} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
