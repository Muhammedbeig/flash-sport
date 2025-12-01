"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MatchWidget from "@/components/match/MatchWidget";
import { Skeleton } from "@/components/ui/Skeleton";

// 1. The inner component that reads the URL params
function MatchDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const sport = searchParams.get("sport") || "football";

  if (!id) {
    return (
      <div className="p-10 text-center text-secondary">
        Invalid Match ID provided.
      </div>
    );
  }

  return <MatchWidget matchId={id} sport={sport} />;
}

// 2. The main page component with Suspense
export default function MatchPage() {
  return (
    <div className="min-h-screen theme-bg p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div>
          <Link 
            href={`/`}
            className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors hover:translate-x-[-2px] duration-200"
          >
            <ArrowLeft size={16} />
            Back to Feed
          </Link>
        </div>

        {/* CRITICAL: Suspense prevents the "White Screen" crash 
           by handling the async reading of searchParams 
        */}
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