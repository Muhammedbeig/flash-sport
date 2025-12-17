import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen theme-bg">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="theme-bg border theme-border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="w-full md:flex-1 space-y-3">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-44 rounded-lg" />
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="theme-bg border theme-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-3 border-b theme-border pb-3">
                <Skeleton className="w-8 h-8 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-28 rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-4 text-center">
                {Array.from({ length: 6 }).map((__, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-3 w-14 mx-auto rounded-md" />
                    <Skeleton className="h-6 w-10 mx-auto rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
