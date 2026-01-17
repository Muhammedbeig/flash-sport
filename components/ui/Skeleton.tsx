"use client";

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes skeleton-shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
      <div
        className={cn(
          "relative overflow-hidden rounded-md",
          // SHIMMER EFFECT:
          // 1. Absolute overlay moving across
          // 2. White gradient (works on both light/dark gray backgrounds)
          "after:absolute after:inset-0 after:-translate-x-full after:animate-[skeleton-shimmer_1.2s_infinite]",
          "after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent",
          className
        )}
        // FORCE THEME COLOR from your globals.css
        style={{ backgroundColor: "var(--skeleton)" }}
        {...props}
      />
    </>
  );
}

export { Skeleton };