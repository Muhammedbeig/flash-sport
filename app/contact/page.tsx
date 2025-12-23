// app/contact/page.tsx
import { Mail, ArrowRight, Info, Phone, MapPin } from "lucide-react";
import { readStaticPageContent } from "@/lib/seo/static-page-content";

export default async function ContactPage() {
  const pageJson = await readStaticPageContent("contact");
  const content = pageJson.content;

  const email =
    content.contactDetails?.email ||
    content.supportEmail ||
    "service@livesoccerr.com";

  const phone =
    content.contactDetails?.phone ||
    content.phone ||
    "";

  const address1 =
    content.contactDetails?.addressLine1 ||
    content.addressLine1 ||
    "";

  const address2 =
    content.contactDetails?.addressLine2 ||
    content.addressLine2 ||
    "";

  const h1 = content.h1 || "Contact";
  const intro = content.intro || [];

  const cardTitle = content.cardTitle || "Email Support";
  const cardSubtitle = content.cardSubtitle || "Send us an email and we’ll respond as soon as possible.";
  const note = content.note || "For faster support, include the sport, league, match/player link, and screenshots if relevant.";

  return (
    <div className="w-full min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">
            {h1}
          </h1>

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
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/10 text-secondary text-xs font-bold">
                <Phone size={16} className="shrink-0" />
                <span>{phone}</span>
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

          <div className="mt-2 flex items-center gap-2 px-5 py-3 rounded-xl bg-secondary/10 text-secondary text-xs font-bold">
            <Info size={16} className="shrink-0" />
            <span>{note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
