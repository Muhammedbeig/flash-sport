import { Skeleton } from "@/components/ui/Skeleton";

export default function FeedSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Simulate 3 different league blocks */}
      {[1, 2, 3].map((league) => (
        <div key={league} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* League Header (Flag + League Name) */}
          <div className="flex items-center gap-3 p-3 border-b border-gray-100 bg-gray-50/50">
            <Skeleton className="h-6 w-6 rounded-full" /> {/* Flag */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" /> {/* League Name */}
              <Skeleton className="h-3 w-16" /> {/* Country */}
            </div>
          </div>

          {/* Match Rows */}
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((match) => (
              <div key={match} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                
                {/* Time / Status */}
                <div className="flex flex-col items-center w-12 gap-1 mr-4 border-r border-gray-100 pr-4">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-10" />
                </div>

                {/* Teams */}
                <div className="flex-1 space-y-3">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-4" /> {/* Score */}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-4" /> {/* Score */}
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