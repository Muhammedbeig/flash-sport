"use client";

import { Suspense } from "react";
import PlayerProfile from "@/components/player/PlayerProfile";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PlayerPage() {
  return (
    <div className="min-h-screen theme-bg p-4 md:p-6">
      <div className="max-w-4xl mx-auto mb-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Matches
        </Link>
      </div>
      
      <Suspense fallback={<div className="text-center p-10">Loading Profile...</div>}>
        <PlayerProfile />
      </Suspense>
    </div>
  );
}