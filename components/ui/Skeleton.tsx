"use client";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base animation
        "animate-pulse rounded-md",
        // The Magic Fix: Uses the variable defined in globals.css
        "bg-skeleton",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };