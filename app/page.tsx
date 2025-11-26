"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Star } from "lucide-react";
import GameWidget from "@/components/widgets/GameWidget";
import Footer from "@/components/layout/Footer";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const sport = searchParams.get("sport") || "football";
  const leagueId = searchParams.get("league") || undefined;
  const viewParam = searchParams.get("view");

  const isMatchMode = viewParam === "match";
  const isFavoritesMode = viewParam === "favorites";

  const [isMatchView, setIsMatchView] = useState(false);
  const matchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMatchMode) {
      setIsMatchView(true);
    } else {
      setIsMatchView(false);
      if (matchContainerRef.current) {
        matchContainerRef.current.innerHTML = "";
      }
    }
  }, [isMatchMode]);

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleMatchOpen = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("view") !== "match") {
      params.set("view", "match");
      window.history.pushState(null, "", `?${params.toString()}`);
      setIsMatchView(true);
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && matchContainerRef.current?.hasChildNodes()) {
           handleMatchOpen();
        }
      }
    });

    if (matchContainerRef.current) {
      observer.observe(matchContainerRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [searchParams]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get("view")) {
        setIsMatchView(false);
        if (matchContainerRef.current) matchContainerRef.current.innerHTML = "";
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-900">
      
      <div className="max-w-5xl mx-auto relative flex-1 w-full min-h-[80vh]">
        
        {/* FEED VIEW */}
        <div className={isMatchView ? "hidden" : "block"}>
          
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
              {isFavoritesMode ? (
                <>
                  <Star className="text-yellow-500 fill-yellow-500" size={24} />
                  My Favorites
                </>
              ) : (
                <>
                  {leagueId ? "League Matches" : `All ${sport} Matches`}
                </>
              )}
            </h2>
          </div>

          <GameWidget 
            key={`${sport}-${leagueId}-${viewParam}`} 
            sport={sport} 
            leagueId={leagueId} 
          />
        </div>

        {/* MATCH DETAILS VIEW */}
        <div className={isMatchView ? "block animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
          
          <div className="mb-4 flex items-center gap-2">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors shadow-sm"
            >
              <ArrowLeft size={18} />
              Back to {isFavoritesMode ? "Favorites" : "Feed"}
            </button>
          </div>

          <div 
            id="match-details-container" 
            ref={matchContainerRef}
            className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 min-h-[600px] overflow-hidden"
          ></div>

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
    <Suspense fallback={<div className="p-10 text-center bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-300">Loading FlashSport...</div>}>
      <HomeContent />
    </Suspense>
  );
}