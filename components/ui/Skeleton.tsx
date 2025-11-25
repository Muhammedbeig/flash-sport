import { cn } from "@/lib/utils"; // See note below regarding utility class
// If you don't have a utils file yet, you can simple remove cn() and use template literals, 
// but for a clean setup, I will provide the standard utility below.

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
      {...props}
    />
  );
}

export { Skeleton };