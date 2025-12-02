import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="w-full min-h-screen theme-bg p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="w-32 h-8" />
          <Skeleton className="w-20 h-8" />
        </div>

        {/* Scoreboard Skeleton */}
        <div className="theme-bg theme-border border rounded-xl p-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-32 h-6" />
          </div>
          <Skeleton className="w-24 h-10" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-16 h-16 rounded-full" />
          </div>
        </div>

        {/* Content Skeleton */}
        <Skeleton className="w-full h-96 rounded-xl" />
      </div>
    </div>
  );
}