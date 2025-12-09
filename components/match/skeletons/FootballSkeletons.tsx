"use client";

import { Skeleton } from "@/components/ui/Skeleton";

// 1. SCOREBOARD SKELETON (For FootballMatchWidget)
export function FootballScoreboardSkeleton() {
  return (
    <div className="theme-bg rounded-xl border theme-border overflow-hidden">
      <div className="p-6 border-b theme-border flex flex-col items-center gap-6">
         {/* League Badge */}
         <Skeleton className="h-5 w-32 rounded-full" />
         
         <div className="flex items-center justify-between w-full max-w-2xl mt-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3 w-1/3">
               <Skeleton className="w-16 h-16 rounded-full" />
               <Skeleton className="h-5 w-24 rounded-md" />
            </div>
            
            {/* Score Placeholder */}
            <div className="flex flex-col items-center justify-center gap-3">
               <Skeleton className="h-8 w-20 rounded-md" />
               <Skeleton className="h-4 w-12 rounded-full" />
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3 w-1/3">
               <Skeleton className="w-16 h-16 rounded-full" />
               <Skeleton className="h-5 w-24 rounded-md" />
            </div>
         </div>
      </div>
      {/* Tab Bar Placeholder */}
      <div className="flex items-center gap-2 px-4 border-b theme-border h-12 overflow-hidden">
         {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-6 w-20 rounded-full" />)}
      </div>
      {/* Content Placeholder */}
      <div className="p-6">
         <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// 2. H2H MATCH LIST SKELETON (For FootballH2H)
export function FootballH2HSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-xl border theme-border">
           {/* Date Column */}
           <div className="flex flex-col gap-2 w-24 shrink-0 border-r theme-border mr-2 pr-2">
              <Skeleton className="h-3 w-16 rounded" />
              <Skeleton className="h-3 w-10 rounded" />
           </div>
           {/* Teams & Score Column */}
           <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                 <Skeleton className="h-4 w-32 rounded" />
                 <Skeleton className="h-4 w-6 rounded" />
              </div>
              <div className="flex justify-between items-center">
                 <Skeleton className="h-4 w-32 rounded" />
                 <Skeleton className="h-4 w-6 rounded" />
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}