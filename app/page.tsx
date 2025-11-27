"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import GameWidget from "@/components/widgets/GameWidget";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Params
  const sport = searchParams.get("sport") || "football";
  const leagueId = searchParams.get("league") || undefined;
  const viewParam = searchParams.get("view");
  const isFavoritesMode = viewParam === "favorites";
  
  // MATCH MODE: Treat this as a completely separate page view
  const isMatchMode = viewParam === "match";

  const matchContainerRef = useRef<HTMLDivElement>(null);

  // 1. Back Navigation
  const handleBack = () => {
    if (matchContainerRef.current) {
      matchContainerRef.current.innerHTML = "";
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  };

  // 2. Observer: Detect Widget Rendering
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      // If the widget injects content into our match container, force the "Separate Page" mode
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

  // 3. Handle Browser Back Button
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
      
      {/* === SCENARIO A: MATCH DETAILS PAGE === */}
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
            >
              {/* Widget injects Match Data here */}
            </div>
          </div>
        </div>
      )}

      {/* === SCENARIO B: MAIN FEED PAGE === */}
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
              `All ${sport} Matches`
            )}
          </h2>
        </div>

        <GameWidget
          key={`${sport}-${leagueId}-${isFavoritesMode}`} 
          sport={sport}
          leagueId={leagueId}
        />
      </div>

      {/* Hidden container to catch clicks when in Feed mode */}
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