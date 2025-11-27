"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function FeedSkeleton() {
  return (
    <div className="w-full space-y-4">
      {/* Loop to simulate 3 Leagues loading */}
      {[1, 2, 3].map((league) => (
        <div
          key={league}
          className="theme-bg rounded-xl theme-border border shadow-sm overflow-hidden"
        >
          {/* HEADER (Country + League Name) */}
          <div className="flex items-center gap-3 p-3 theme-border border-b">
            <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 w-full">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>

          {/* MATCH ROWS */}
          <div className="divide-y theme-border divide-solid">
            {[1, 2, 3].map((match) => (
              <div
                key={match}
                className="p-4 flex items-center justify-between"
              >
                {/* Status / Time Column */}
                <div className="flex flex-col items-center justify-center w-12 gap-2 mr-4 theme-border border-r pr-4 shrink-0">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-10" />
                </div>

                {/* Teams & Scores Column */}
                <div className="flex-1 space-y-3">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-24 sm:w-40" />
                    </div>
                    <Skeleton className="h-4 w-6" />
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                      <Skeleton className="h-4 w-24 sm:w-40" />
                    </div>
                    <Skeleton className="h-4 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}