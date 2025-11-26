import { Skeleton } from "@/components/ui/Skeleton";

export default function FeedSkeleton() {
  return (
    <div className="w-full space-y-6">

      {[1, 2, 3].map((league) => (
        <div
          key={league}
          className="theme-bg rounded-xl theme-border border shadow-sm overflow-hidden"
        >

          {/* League Header */}
          <div className="flex items-center gap-3 p-3 theme-border border-b bg-gray-50/50 dark:bg-slate-900/40">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Match Skeleton Rows */}
          <div className="divide-y theme-border divide-gray-100 dark:divide-slate-700">
            {[1, 2, 3].map((match) => (
              <div
                key={match}
                className="p-4 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors flex items-center justify-between"
              >
                {/* Time Section */}
                <div className="flex flex-col items-center w-12 gap-1 mr-4 theme-border border-r pr-4">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-10" />
                </div>

                {/* Teams */}
                <div className="flex-1 space-y-3">

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-4" />
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
