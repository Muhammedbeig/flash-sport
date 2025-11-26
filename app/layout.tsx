import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import WidgetThemeConfig from "@/components/WidgetThemeConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlashSport",
  description: "Live scores and stats",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <head>
        <script
          type="module"
          src="https://widgets.api-sports.io/3.1.0/widgets.js"
        ></script>
        {/* Prevent flash of unstyled content */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>

      <body
        className={`${inter.className} bg-white dark:bg-slate-900 text-slate-900 dark:text-white`}
      >
        <ThemeProvider>
          {/* Sync theme for widgets */}
          <WidgetThemeConfig />

          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                Loading FlashSport...
              </div>
            }
          >
            <AppShell>{children}</AppShell>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}