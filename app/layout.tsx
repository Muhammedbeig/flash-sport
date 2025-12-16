import "./globals.css";
import type { Metadata } from "next";
import { resolveRootSeo } from "@/lib/seo/seo-resolver";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import HtmlThemeSync from "@/components/HtmlThemeSync";
import WidgetThemeConfig from "@/components/WidgetThemeConfig";
import AppShell from "@/components/layout/AppShell";

export async function generateMetadata(): Promise<Metadata> {
  return resolveRootSeo();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const API_KEY = process.env.NEXT_PUBLIC_API_SPORTS_KEY ?? "";
  const SHOW_ERRORS = process.env.NEXT_PUBLIC_WIDGET_SHOW_ERRORS === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
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

        <ThemeProvider>
          <HtmlThemeSync />
          <WidgetThemeConfig />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
