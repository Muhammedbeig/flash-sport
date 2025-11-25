import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FlashSport",
  description: "Live scores and stats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* FIX 1: UPDATED SCRIPT VERSION TO 3.1.0  */}
        <script
          type="module"
          src="https://widgets.api-sports.io/3.1.0/widgets.js"
        ></script>
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        
        {/* FIX 2: GLOBAL CONFIGURATION 
            - We added data-show-errors="true" to see why it fails 
            - Ensure your API Key is correct here.
        */}
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <api-sports-widget 
                data-type="config" 
                data-key="be86d04ad385764f2c39ce3b4c832510" 
                data-sport="football" 
                data-theme="white" 
                data-show-logos="true"
                data-show-errors="true" 
              ></api-sports-widget>
            `,
          }}
          style={{ display: "none" }} // We hide the config widget visually
        />

        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}