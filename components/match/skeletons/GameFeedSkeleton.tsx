"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export function GameFeedSkeleton() {
  return (
    <div className="space-y-3">
      {/* Generate 6 skeleton rows */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div 
          key={i} 
          className="flex items-center justify-between p-4 rounded-xl border shadow-sm"
          // Force White Background (Light) / Dark Slate (Dark)
          style={{ 
            backgroundColor: "var(--background)", 
            borderColor: "var(--widget-border)" 
          }}
        >
           {/* LEFT: Time & Status */}
           <div className="flex flex-col gap-2 w-16 border-r pr-4 mr-4" style={{ borderColor: "var(--widget-border)" }}>
              <Skeleton className="h-3 w-12" /> {/* Time */}
              <Skeleton className="h-3 w-8" />  {/* Status */}
           </div>

           {/* CENTER: Match Info */}
           <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              {/* Home Team */}
              <div className="flex items-center gap-3 justify-end">
                 <Skeleton className="h-4 w-24 hidden sm:block" /> {/* Name */}
                 <Skeleton className="w-8 h-8 rounded-full" />     {/* Logo */}
              </div>

              {/* Score Box */}
              <div className="flex flex-col items-center justify-center gap-1">
                 <div className="flex gap-2">
                    <Skeleton className="h-6 w-5 rounded" />
                    <span className="opacity-20">:</span>
                    <Skeleton className="h-6 w-5 rounded" />
                 </div>
              </div>

              {/* Away Team */}
              <div className="flex items-center gap-3 justify-start">
                 <Skeleton className="w-8 h-8 rounded-full" />     {/* Logo */}
                 <Skeleton className="h-4 w-24 hidden sm:block" /> {/* Name */}
              </div>
           </div>
        </div>
      ))}
    </div>
  );
}