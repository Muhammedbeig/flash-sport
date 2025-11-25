"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import GameWidget from "@/components/widgets/GameWidget";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const sport = searchParams.get("sport") || "football";
  // We use 'view' param to track if we are in match mode
  const isMatchMode = searchParams.get("view") === "match";
  
  // We still need undefined here to show ALL matches
  const leagueId = undefined; 

  // Local state to manage visibility instanty while URL updates
  const [isMatchView, setIsMatchView] = useState(false);
  const matchContainerRef = useRef<HTMLDivElement>(null);

  // Sync State with URL (Handle Browser Back Button)
  useEffect(() => {
    if (isMatchMode) {
      setIsMatchView(true);
    } else {
      setIsMatchView(false);
      // Clear container when going back to feed to prevent flashes
      if (matchContainerRef.current) {
        matchContainerRef.current.innerHTML = "";
      }
    }
  }, [isMatchMode]);

  // Function: Handle "Back to Feed" button click
  const handleBack = () => {
    // Remove 'view' param from URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  };

  // Function: Handle "Match Clicked" (triggered by Observer)
  const handleMatchOpen = () => {
    // Add 'view=match' to URL without reloading the page fully
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("view") !== "match") {
      params.set("view", "match");
      // We use router.push to update the URL so it looks like a navigation
      // shallow: true (default in Next 14 app router for search params)
      window.history.pushState(null, "", `?${params.toString()}`);
      
      // Manually set state since pushState doesn't trigger useEffect immediately in some cases
      setIsMatchView(true);
    }
    window.scrollTo(0, 0);
  };

  // Observer: Detects when the Widget injects the Match Details
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
  }, [searchParams]); // Re-bind if params change

  // Handle Browser PopState (Back Button) specifically for the pushState we did
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
    <div className="max-w-5xl mx-auto relative min-h-[80vh]">
      
      {/* --- VIEW 1: THE FEED --- */}
      <div className={isMatchView ? "hidden" : "block"}>
        <div className="mb-4 flex items-center justify-between">
           <h2 className="text-xl font-bold text-slate-800 capitalize">
             All {sport} Matches
           </h2>
        </div>

        <GameWidget 
          key={`${sport}`} 
          sport={sport} 
          leagueId={leagueId} 
        />
      </div>

      {/* --- VIEW 2: MATCH DETAILS (Full Page) --- */}
      <div className={isMatchView ? "block animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
        
        {/* Back Button Header */}
        <div className="mb-4 flex items-center gap-2">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-700 font-medium transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
            Back to Feed
          </button>
        </div>

        {/* TARGET CONTAINER */}
        <div 
          id="match-details-container" 
          ref={matchContainerRef}
          className="w-full bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] overflow-hidden"
        >
          {/* API-Sports Widget content appears here */}
        </div>

      </div>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}