"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
// FIX: Import the Master Switch Widget from the correct location
import MatchWidget from "@/components/match/MatchWidget"; 
import { Skeleton } from "@/components/ui/Skeleton";

// 1. Inner component to read URL params safely
function MatchDetailsContent() {
  const searchParams = useSearchParams();
  
  const id = searchParams.get("id");
  
  // Parse "football/lineups" -> sport="football", tab="lineups"
  const rawSport = searchParams.get("sport") || "football";
  const [sportName, tabParam] = rawSport.split("/");

  if (!id) {
    return (
      <div className="p-10 text-center text-secondary">
        Invalid Match ID provided.
      </div>
    );
  }

  return (
    <MatchWidget 
      matchId={id} 
      sport={sportName} 
      initialTab={tabParam} 
    />
  );
}

// 2. Main Page Component
export default function MatchPage() {
  return (
    <div className="min-h-screen theme-bg p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Suspense Boundary is CRITICAL for Static Exports */}
        <Suspense 
          fallback={
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
          }
        >
          <MatchDetailsContent />
        </Suspense>

      </div>
    </div>
  );
}