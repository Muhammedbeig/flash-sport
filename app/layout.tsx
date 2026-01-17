import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveRootSeo } from "@/lib/seo/seo-resolver";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import HtmlThemeSync from "@/components/HtmlThemeSync";
import WidgetThemeConfig from "@/components/WidgetThemeConfig";
import AppShell from "@/components/layout/AppShell";

export async function generateMetadata(): Promise<Metadata> {
  // ✅ resolver is async now (DB override)
  return await resolveRootSeo();
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ✅ Next.js (your version): headers() is async
  const h = await headers();
  const host = (h.get("host") || "").toLowerCase();
  const hostname = host.split(":")[0];

  const adminSubdomain = (process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN || "admin").toLowerCase();
  const isAdminHost = hostname.startsWith(`${adminSubdomain}.`);

  const API_KEY = process.env.NEXT_PUBLIC_API_SPORTS_KEY ?? "";
  const SHOW_ERRORS = process.env.NEXT_PUBLIC_WIDGET_SHOW_ERRORS === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        {/* ✅ Keep existing widgets ONLY for main site */}
        {!isAdminHost ? (
          <>
            <script type="module" src="https://widgets.api-sports.io/3.1.0/widgets.js" />

            {API_KEY && (
              <div
                dangerouslySetInnerHTML={{
                  __html: `
                    <api-sports-widget 
                      data-type="config"
                      data-key="${API_KEY}"
                      data-sport="football"
                      data-theme="white"
                      data-show-errors="${SHOW_ERRORS}"
                    ></api-sports-widget>
                  `,
                }}
              />
            )}
          </>
        ) : null}

        <ThemeProvider>
          <HtmlThemeSync />
          <WidgetThemeConfig />

          {/* ✅ MAIN site keeps AppShell exactly same, ADMIN subdomain bypasses it */}
          {isAdminHost ? children : <AppShell>{children}</AppShell>}
        </ThemeProvider>
      </body>
    </html>
  );
}
