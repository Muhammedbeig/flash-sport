"use client";

import { Suspense } from "react";
import PlayerProfile from "@/components/player/PlayerProfile"; // ⚠️ Check this path matches where you saved PlayerProfile.tsx
import { Loader2 } from "lucide-react";

// 1. The Spinner Component
// Baked directly into the file to ensure instant loading on GitHub Pages
function PlayerLoading() {
  return (
    <div className="w-full min-h-screen theme-bg flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-secondary text-sm font-medium animate-pulse">
        Loading player profile...
      </p>
    </div>
  );
}

// 2. The Main Page
export default function PlayerPage() {
  return (
    <div className="w-full min-h-screen theme-bg">
      {/* CRITICAL FIX: 
        The 'fallback' is what the user sees immediately (stopping the white screen).
        Once the browser is ready, it swaps this for <PlayerProfile />.
      */}
      <Suspense fallback={<PlayerLoading />}>
        <PlayerProfile />
      </Suspense>
    </div>
  );
}