"use client";

import { Skeleton } from "@/components/ui/Skeleton";

// HELPER: Consistent styling across all sports
const cardClass = "rounded-xl border overflow-hidden shadow-sm";
const cardStyle = { 
  backgroundColor: "rgb(var(--background))", 
  borderColor: "var(--widget-border)" 
};

// 1. BASEBALL SCOREBOARD SKELETON
export function BaseballScoreboardSkeleton() {
  return (
    <div className={cardClass} style={cardStyle}>
      <div className="p-6 border-b flex flex-col items-center gap-6 relative" style={{ borderColor: "var(--widget-border)" }}>
         {/* League Badge */}
         <div className="absolute top-4 left-4">
            <Skeleton className="h-6 w-32 rounded-md" />
         </div>
         
         <div className="flex items-center justify-between w-full max-w-2xl mt-8">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-4 w-1/3">
               <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
               <Skeleton className="h-5 w-24 sm:w-32 rounded-md" />
            </div>
            
            {/* Score Center (Innings/Runs) */}
            <div className="flex flex-col items-center justify-center gap-2">
               <Skeleton className="h-10 w-24 rounded-lg" /> {/* Total Runs */}
               <div className="flex gap-1 mt-1">
                  {/* Simulate 9 Innings (small dots) */}
                  {[1,2,3,4,5,6,7,8,9].map(i => (
                     <Skeleton key={i} className="h-3 w-3" />
                  ))}
               </div>
               <Skeleton className="h-4 w-16 rounded-full mt-1" /> {/* Status (e.g. "Bottom 7th") */}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-4 w-1/3">
               <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
               <Skeleton className="h-5 w-24 sm:w-32 rounded-md" />
            </div>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 border-b h-12" style={{ borderColor: "var(--widget-border)" }}>
         {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-lg shrink-0" />)}
      </div>

      {/* Content */}
      <div className="p-6">
         <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// 2. BASEBALL H2H SKELETON
export function BaseballH2HSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`flex items-center justify-between p-3 ${cardClass}`} style={cardStyle}>
           {/* Date */}
           <div className="flex flex-col gap-2 w-24 shrink-0 border-r mr-4 pr-2" style={{ borderColor: "var(--widget-border)" }}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
           </div>
           {/* Teams & Score */}
           <div className="flex-1 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                 </div>
                 <Skeleton className="h-5 w-8" />
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                 </div>
                 <Skeleton className="h-5 w-8" />
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}

// 3. BASEBALL STANDINGS SKELETON
export function BaseballStandingsSkeleton() {
  return (
    <div className="p-4 space-y-8">
      {[1, 2].map((g) => (
        <div key={g} className="space-y-4">
           <Skeleton className="h-6 w-40" /> {/* Division Name */}
           
           <div className={cardClass} style={cardStyle}>
              {/* Header */}
              <div className="border-b p-3 flex justify-between" style={{ borderColor: "var(--widget-border)", backgroundColor: "var(--widget-hover)" }}>
                 <Skeleton className="h-4 w-8" />
                 <Skeleton className="h-4 w-32" />
                 <div className="flex gap-4">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-8" />
                 </div>
              </div>
              {/* Rows */}
              {[1, 2, 3, 4, 5].map((r) => (
                 <div key={r} className="p-3 flex items-center justify-between border-b last:border-0" style={{ borderColor: "var(--widget-border)" }}>
                    <Skeleton className="h-4 w-6" />
                    <div className="flex items-center gap-3 flex-1 ml-4">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                 </div>
              ))}
           </div>
        </div>
      ))}
    </div>
  );
}

// 4. BASEBALL ODDS SKELETON
export function BaseballOddsSkeleton() {
  return (
    <div className="p-4 space-y-6">
      {/* Bookmaker Header */}
      <div className="border-b pb-2 mb-4" style={{ borderColor: "var(--widget-border)" }}>
         <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`p-3 ${cardClass}`} style={cardStyle}>
             <Skeleton className="h-3 w-24 mb-3" /> {/* Market Name */}
             <div className="flex gap-2">
                {[1, 2].map((j) => ( /* Moneyline (Home/Away) */
                   <div 
                     key={j} 
                     className="flex-1 h-9 rounded border flex items-center justify-between px-2" 
                     style={{ borderColor: "var(--widget-border)" }}
                   >
                      <Skeleton className="h-2 w-6" />
                      <Skeleton className="h-3 w-8" />
                   </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}