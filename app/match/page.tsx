"use client";

import { useSearchParams } from "next/navigation";
import MatchWidget from "@/components/widgets/MatchWidget"; 
import { Suspense } from "react";

function MatchContent() {
  const searchParams = useSearchParams();
  
  // Get ID and Sport from query string: /match?id=123&sport=football
  const matchId = searchParams.get("id");
  const sport = searchParams.get("sport") || "football";

  if (!matchId) {
    return (
      <div className="p-8 text-center text-secondary">
        <h2 className="text-xl font-bold">No Match Selected</h2>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Container for the match details widget */}
      <div className="theme-bg rounded-xl shadow-sm border theme-border overflow-hidden min-h-[600px]">
        <MatchWidget matchId={matchId} sport={sport} />
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    // Suspense is required for useSearchParams in static exports
    <Suspense fallback={<div className="p-10 text-center">Loading match details...</div>}>
      <MatchContent />
    </Suspense>
  );
}