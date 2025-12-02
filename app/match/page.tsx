"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MatchWidget from "@/components/match/MatchWidget";

// --- Logic Component ---
function MatchContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const sport = searchParams.get("sport") || "football";

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-4">
        <h2 className="text-xl font-bold text-primary">Match Not Found</h2>
        <button 
          onClick={() => window.close()} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Close Tab
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-2 md:px-0 animate-in fade-in duration-500">
      <MatchWidget matchId={id} sport={sport} />
    </div>
  );
}

// --- Main Page ---
export default function MatchPage() {
  return (
    <div className="w-full min-h-screen theme-bg">
      <Suspense fallback={null}>
        <MatchContent />
      </Suspense>
    </div>
  );
}