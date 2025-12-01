"use client";

import { Suspense } from "react";
import PlayerProfile from "@/components/player/PlayerProfile";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PlayerPage() {
  return (
    <div className="min-h-screen theme-bg p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Suspense Boundary is CRITICAL for Static Exports */}
        <Suspense 
          fallback={
            <div className="space-y-4">
              <div className="flex gap-6 items-center">
                <Skeleton className="w-32 h-32 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-6">
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          }
        >
          <PlayerProfile />
        </Suspense>

      </div>
    </div>
  );
}