"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Star } from "lucide-react";
import GameWidget from "@/components/widgets/GameWidget";
import Footer from "@/components/layout/Footer";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL params
  const sport = searchParams.get("sport") || "football";
  const leagueId = searchParams.get("league") || undefined;
  const viewParam = searchParams.get("view");
  const isFavoritesMode = viewParam === "favorites";
  
  // We determine "Match Mode" if the view param is set to match
  const isMatchMode = viewParam === "match";

  // References
  const matchContainerRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // 1. Handle "Back" navigation
  const handleBack = () => {
    if (matchContainerRef.current) {
      matchContainerRef.current.innerHTML = "";
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  };

  // 2. Observer: Detect when the Widget writes to our hidden container
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (matchContainerRef.current?.hasChildNodes() && !isMatchMode) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("view", "match");
        router.push(`${pathname}?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    if (matchContainerRef.current) {
      observer.observe(matchContainerRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [searchParams, pathname, router, isMatchMode]);

  // 3. Handle Browser Back Button (Popstate)
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
    <div className="flex flex-col min-h-screen theme-bg transition-colors duration-200">
      <div className="max-w-5xl mx-auto relative flex-1 w-full min-h-[80vh] theme-bg p-4 md:p-0">

        {/* HEADER / BREADCRUMB */}
        {!isMatchMode && (
          <div className="mb-4 flex items-center justify-between animate-in fade-in duration-300">
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
        )}

        {/* FEED VIEW */}
        <div 
          ref={feedContainerRef}
          className={isMatchMode ? "hidden" : "block animate-in fade-in duration-300"}
        >
          <GameWidget
            key={`${sport}-${leagueId}-${isFavoritesMode}`} 
            sport={sport}
            leagueId={leagueId}
          />
        </div>

        {/* MATCH DETAIL VIEW */}
        <div className={!isMatchMode ? "hidden" : "block animate-in slide-in-from-right-8 duration-300"}>
          
          <div className="mb-4 flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 theme-bg theme-border border rounded-lg hover:opacity-80 text-secondary font-medium transition-colors shadow-sm"
            >
              <ArrowLeft size={18} />
              Back to {isFavoritesMode ? "Favorites" : "Feed"}
            </button>
          </div>

          <div
            id="match-details-container"
            ref={matchContainerRef}
            className="w-full theme-bg theme-border border rounded-xl shadow-sm min-h-[600px] overflow-hidden bg-white dark:bg-slate-900"
          >
            {/* The Widget injects HTML here automatically */}
          </div>
        </div>

      </div>

      <div className="mt-12">
        <Footer />
      </div>
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