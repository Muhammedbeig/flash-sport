"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MatchWidget from "@/components/match/MatchWidget";
import { Skeleton } from "@/components/ui/Skeleton";

// 1. The Content Component (Reads URL params)
function MatchPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const sport = searchParams.get("sport") || "football";

  if (!id) {
    return (
      <div className="p-10 text-center text-secondary">
        Invalid match ID. Please close this tab and try again.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-2 md:px-0">
      <MatchWidget matchId={id} sport={sport} />
    </div>
  );
}

// 2. The Page Component (Wraps in Suspense to prevent White Screen)
export default function MatchPage() {
  return (
    <div className="w-full min-h-screen theme-bg">
      <Suspense 
        fallback={
          <div className="max-w-5xl mx-auto py-6 px-4 space-y-4">
             {/* This Skeleton shows IMMEDIATELY while data loads */}
            <Skeleton className="w-full h-10 rounded-lg" />
            <Skeleton className="w-full h-[200px] rounded-xl" />
            <Skeleton className="w-full h-[400px] rounded-xl" />
          </div>
        }
      >
        <MatchPageContent />
      </Suspense>
    </div>
  );
}