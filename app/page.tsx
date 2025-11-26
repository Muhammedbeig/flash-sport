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
  
  // 1. Get URL Parameters
  const sport = searchParams.get("sport") || "football";
  const leagueId = searchParams.get("league") || undefined;
  const viewParam = searchParams.get("view"); // "match" or "favorites"

  // 2. Determine View State
  const isMatchMode = viewParam === "match";
  const isFavoritesMode = viewParam === "favorites";

  // 3. Local State for Match View (Instant visibility toggle)
  const [isMatchView, setIsMatchView] = useState(false);
  const matchContainerRef = useRef<HTMLDivElement>(null);

  // 4. Sync State with URL (Handle Browser Back Button)
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

  // 5. Function: Handle "Back to Feed" button click
  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view"); // Remove view param to go back to default feed
    router.push(`${pathname}?${params.toString()}`);
  };

  // 6. Function: Handle "Match Clicked" (Triggered by Observer)
  const handleMatchOpen = () => {
    const params = new URLSearchParams(searchParams.toString());
    // Only update URL if not already in match view
    if (params.get("view") !== "match") {
      params.set("view", "match");
      // Update URL without full reload (Shallow routing)
      window.history.pushState(null, "", `?${params.toString()}`);
      setIsMatchView(true);
    }
    window.scrollTo(0, 0);
  };

  // 7. Observer: Detects when Widget injects Match Details into the container
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

  // 8. Handle Browser PopState (Hardware Back Button)
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

  // --- RENDER ---
  return (
    <div className="flex flex-col min-h-screen">
      
      <div className="max-w-5xl mx-auto relative flex-1 w-full min-h-[80vh]">
        
        {/* === VIEW 1: THE FEED (List of Matches) === */}
        {/* Hidden when viewing a specific match details */}
        <div className={isMatchView ? "hidden" : "block"}>
          
          {/* Feed Header */}
          <div className="mb-4 flex items-center justify-between">
             <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
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

          {/* The Main Widget */}
          <GameWidget 
            // Key forces reload when switching sports or views (essential for Favorites)
            key={`${sport}-${leagueId}-${viewParam}`} 
            sport={sport} 
            leagueId={leagueId} 
          />
        </div>

        {/* === VIEW 2: MATCH DETAILS (Full Page) === */}
        {/* Visible only when 'view=match' */}
        <div className={isMatchView ? "block animate-in fade-in slide-in-from-right-4 duration-300" : "hidden"}>
          
          {/* Back Navigation */}
          <div className="mb-4 flex items-center gap-2">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-slate-700 font-medium transition-colors shadow-sm"
            >
              <ArrowLeft size={18} />
              Back to {isFavoritesMode ? "Favorites" : "Feed"}
            </button>
          </div>

          {/* TARGET CONTAINER 
             The API-Sports Widget injects the Match Details / Team Profile here.
          */}
          <div 
            id="match-details-container" 
            ref={matchContainerRef}
            className="w-full bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] overflow-hidden"
          >
            {/* Content injected by widget script */}
          </div>

        </div>

      </div>

      {/* === FOOTER === */}
      <div className="mt-12">
        <Footer />
      </div>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading FlashSport...</div>}>
      <HomeContent />
    </Suspense>
  );
}