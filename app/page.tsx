"use client";

import GameWidget from "@/components/widgets/GameWidget";
import MatchModal from "@/components/layout/MatchModal";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// 1. Create a component for the content that needs params
function HomeContent() {
  const searchParams = useSearchParams();
  const sport = searchParams.get("sport") || "football";
  
  // Logic to determine if we send a specific league ID
  // (We default to Premier League '39' only for football)
  const leagueId = sport === "football" ? "39" : undefined;

  return (
    <>
      <div className="max-w-3xl mx-auto py-4">
        <GameWidget 
          key={sport} 
          sport={sport} 
          leagueId={leagueId} 
        />
      </div>
      <MatchModal />
    </>
  );
}

// 2. Export the Main Page wrapped in Suspense
export default function Home() {
  return (
    // Suspense is REQUIRED when using useSearchParams in a static export
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading Sports Feed...</div>}>
      <HomeContent />
    </Suspense>
  );
}