import type { Metadata } from "next";
import { Mail, ArrowRight, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | LiveSocer",
  description: "Submit your queries or feedback to the LiveSocer team via email. We review every message and will get back to you directly.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  const CONTACT_EMAIL = "service@livesocer.com";

  return (
    <div className="w-full min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Header Section */}
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-primary tracking-tight">
            Contact Us
          </h1>
          
          <div className="prose dark:prose-invert max-w-none text-secondary text-sm md:text-base leading-relaxed">
            <p>
              To make sure your query or feedback gets to the right person, please contact us via email. 
              We review every email and will get back to you in case we need you to provide more information.
            </p>
            <p>
              Thank you for taking the time to submit your feedback.
            </p>
          </div>
        </div>

        {/* Email Action Card */}
        <div className="theme-bg theme-border border rounded-2xl p-8 md:p-12 shadow-xl text-center flex flex-col items-center gap-6 relative overflow-hidden group">
          
          {/* Decorative Background Blur */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500" />
          
          {/* Icon Bubble */}
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
            <Mail size={32} className="text-blue-600 dark:text-blue-400" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">
              Send us an email
            </h2>
            <p className="text-secondary text-sm">
              We are available for support, bug reports, and feedback.
            </p>
          </div>

          {/* Primary Action Button */}
          <a 
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-1"
          >
            <span>{CONTACT_EMAIL}</span>
            <ArrowRight size={18} />
          </a>

          {/* Note - FIXED: Matches Sidebar Hover Styles exactly */}
          {/* Light: bg-slate-100 text-primary */}
          {/* Dark: bg-slate-800/50 text-slate-200 */}
          <div className="mt-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-primary dark:text-slate-200 text-xs font-bold">
            <Info size={16} className="shrink-0" />
            <span>We will use only email for contacting.</span>
          </div>

        </div>

      </div>
    </div>
  );
}