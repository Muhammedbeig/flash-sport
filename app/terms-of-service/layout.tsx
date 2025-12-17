// app/terms-of-service/layout.tsx
import type { Metadata } from "next";
import { SITE_CONTENT } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const brandUrl =
    SITE_CONTENT.brand.siteUrl?.replace(/\/+$/, "") || "https://livesoccerr.com";

  const canonical = `${brandUrl}/terms-of-service`;

  return {
    title: "Terms of Service | LiveSoccerR",
    description:
      "Read LiveSoccerR’s Terms of Service for rules, usage guidelines, and user responsibilities while using our website and app.",
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE_CONTENT.brand.siteName,
      title: "Terms of Service | LiveSoccerR",
      description:
        "Read LiveSoccerR’s Terms of Service for rules, usage guidelines, and user responsibilities while using our website and app.",
      url: canonical,
      images: [
        {
          url: `${brandUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "LiveSoccerR",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Terms of Service | LiveSoccerR",
      description:
        "Read LiveSoccerR’s Terms of Service for rules, usage guidelines, and user responsibilities while using our website and app.",
      images: [`${brandUrl}/og-default.png`],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
