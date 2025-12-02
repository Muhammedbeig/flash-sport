import "./globals.css";
import { SEO_CONTENT } from "@/lib/seo-config";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import HtmlThemeSync from "@/components/HtmlThemeSync";
import WidgetThemeConfig from "@/components/WidgetThemeConfig";
import AppShell from "@/components/layout/AppShell";

// 1. Dynamic Metadata from SEO Config
export const metadata = {
  title: {
    default: SEO_CONTENT.home.metadata.title,
    template: `%s | ${SEO_CONTENT.global.siteName}`,
  },
  description: SEO_CONTENT.home.metadata.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const API_KEY = process.env.NEXT_PUBLIC_API_SPORTS_KEY ?? "";
  const SHOW_ERRORS = process.env.NEXT_PUBLIC_WIDGET_SHOW_ERRORS === "true";

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        {/* 2. Load API-Sports Script 
            We load this globally so it's available for the 'dangerouslySetInnerHTML' widgets.
            The Sidebar/WidgetScriptLoader handles re-triggering if necessary.
        */}
        <script
          type="module"
          src="https://widgets.api-sports.io/3.1.0/widgets.js"
        />

        {/* 3. Global Widget Configuration 
            This hidden widget sets the API Key for all other widgets on the site.
        */}
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

        {/* 4. Providers & Shell */}
        <ThemeProvider>
          <HtmlThemeSync />
          <WidgetThemeConfig />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}