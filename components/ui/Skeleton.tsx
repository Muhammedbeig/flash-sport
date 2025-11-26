import React from "react";

function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 bg-[length:200%_100%] ${className}`}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      {...props}
    />
  );
}

export { Skeleton };
