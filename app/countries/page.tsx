"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function CountriesPage() {
  const searchParams = useSearchParams();
  const sport = searchParams.get("sport") || "football";
  const { theme } = useTheme();
  const widgetTheme = theme === "dark" ? "dark" : "white";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Matches
        </Link>
        <h1 className="text-2xl font-bold text-primary">All Countries & Leagues</h1>
      </div>

      <div className="theme-bg theme-border border rounded-xl shadow-sm p-4 min-h-[600px]">
        {isMounted ? (
          <div
            dangerouslySetInnerHTML={{
              __html: `
                <api-sports-widget 
                  data-type="leagues" 
                  data-sport="${sport}" 
                  data-theme="${widgetTheme}"
                  data-show-errors="false"
                ></api-sports-widget>
              `,
            }}
          />
        ) : (
          <div className="text-center p-10 text-secondary">Loading...</div>
        )}
      </div>
    </div>
  );
}