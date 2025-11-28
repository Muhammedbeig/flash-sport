"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import MatchWidget from "@/components/widgets/MatchWidget"; 

function MatchContent() {
  const searchParams = useSearchParams();

  // /match?id=1487974&sport=football
  const matchId = searchParams.get("id");
  const sport = searchParams.get("sport") || "football";

  // Only show this if there is truly no id in the URL
  if (!matchId) {
    return (
      <div className="p-8 text-center text-secondary">
        <h2 className="text-xl font-bold">No Match Selected</h2>
        <p className="mt-2 text-sm">
          Please open this page from a match link or provide an &quot;id&quot; query parameter.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="theme-bg rounded-xl shadow-sm border theme-border overflow-hidden min-h-[600px]">
        {/* MatchWidget expects matchId as a string, so pass it directly */}
        <MatchWidget matchId={matchId} sport={sport} />
      </div>
    </div>
  );
}

export default function MatchPage() {
  // Suspense is required when using useSearchParams in app router/static export
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading match details...</div>}>
      <MatchContent />
    </Suspense>
  );
}
