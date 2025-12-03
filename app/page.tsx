"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import GameWidget from "@/components/widgets/GameWidget";
import { SEO_CONTENT } from "@/lib/seo-config";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. PARSE SPORT & TAB (e.g. "football/live")
  const rawSport = searchParams.get("sport") || "football";
  const [sportName, tabParam] = rawSport.split("/");
  
  const leagueId = searchParams.get("league") || undefined;
  const viewParam = searchParams.get("view");
  const isFavoritesMode = viewParam === "favorites";
  const isMatchMode = viewParam === "match";

  const matchContainerRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (matchContainerRef.current) {
      matchContainerRef.current.innerHTML = "";
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (matchContainerRef.current?.hasChildNodes() && !isMatchMode) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "match");
        router.push(`${pathname}?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    });

    if (matchContainerRef.current) {
      observer.observe(matchContainerRef.current, { childList: true, subtree: true });
    }
    return () => observer.disconnect();
  }, [searchParams, pathname, router, isMatchMode]);

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.search.includes("view=match")) {
        if (matchContainerRef.current) matchContainerRef.current.innerHTML = "";
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="flex flex-col theme-bg min-h-screen">
      <h1 className="sr-only">{SEO_CONTENT.home.headings.h1}</h1>
      
      {isMatchMode && (
        <div className="animate-in fade-in duration-300 w-full">
          <div className="max-w-5xl mx-auto">
            <div className="mb-4 pt-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 theme-bg theme-border border rounded-lg hover:opacity-80 text-secondary font-medium transition-colors shadow-sm"
              >
                <ArrowLeft size={18} />
                <span>Back to Matches</span>
              </button>
            </div>
            <div
              id="match-details-container"
              ref={matchContainerRef}
              className="w-full theme-bg theme-border border rounded-xl shadow-sm min-h-[800px] overflow-hidden bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      )}

      <div className={isMatchMode ? "hidden" : "block w-full"}>
        <div className="mb-6 flex items-center justify-between px-2 md:px-0">
          <h2 className="text-xl font-bold text-primary capitalize flex items-center gap-2">
            {isFavoritesMode ? (
              <>
                <Star className="text-yellow-500 fill-yellow-500" size={24} />
                My Favorites
              </>
            ) : leagueId ? (
              "League Matches"
            ) : (
              `All ${sportName} Matches`
            )}
          </h2>
        </div>

        <GameWidget
          key={`${sportName}-${leagueId}-${tabParam}`} 
          sport={sportName}
          leagueId={leagueId}
          initialTab={tabParam} // Pass the parsed tab
        />
      </div>

      <div 
        id="match-details-container" 
        ref={!isMatchMode ? matchContainerRef : null} 
        className={!isMatchMode ? "absolute opacity-0 pointer-events-none h-0 overflow-hidden" : "hidden"}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-center theme-bg text-secondary">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}