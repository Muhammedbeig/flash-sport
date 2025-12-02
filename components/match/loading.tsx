import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full min-h-screen theme-bg flex flex-col items-center justify-center gap-4">
      {/* This file is sent instantly by the server. 
         It uses your global theme variables to match the app design.
      */}
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-secondary text-sm font-medium animate-pulse">
        Initializing match feed...
      </p>
    </div>
  );
}