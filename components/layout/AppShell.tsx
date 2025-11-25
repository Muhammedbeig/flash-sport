"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SportIcon } from "@/components/ui/SportIcon";

type AppShellProps = {
  children: ReactNode;
};

// Sports list matching the supported icons
const SPORTS = [
  { name: "Football", id: "football" },
  { name: "Basketball", id: "basketball" },
  { name: "NBA", id: "nba" },
  { name: "American Football", id: "nfl" },
  { name: "Baseball", id: "baseball" },
  { name: "Hockey", id: "hockey" },
  { name: "Handball", id: "handball" },
  { name: "Rugby", id: "rugby" },
  { name: "Volleyball", id: "volleyball" },
  { name: "AFL", id: "afl" },
];

export default function AppShell({ children }: AppShellProps) {
  const searchParams = useSearchParams();
  const currentSport = searchParams.get("sport") || "football";

  return (
    <div className="flex h-screen w-full bg-gray-50 text-slate-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600 tracking-tighter">FlashSport</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Sports
          </div>
          
          {SPORTS.map((sport) => {
            const isActive = currentSport === sport.id;
            
            return (
               <Link 
                 key={sport.id}
                 href={`/?sport=${sport.id}`} 
                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                   isActive 
                    ? "bg-blue-50 text-blue-600 border border-blue-100" 
                    : "text-gray-700 hover:bg-gray-50"
                 }`}
               >
                 <SportIcon 
                    sport={sport.id} 
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                 />
                 {sport.name}
               </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="md:hidden h-14 border-b border-gray-200 bg-white flex items-center justify-center font-bold text-blue-600">
          FlashSport
        </header>

        <div className="flex-1 overflow-y-auto p-4 relative">
            {children}
        </div>
        
        <nav className="md:hidden h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50 pb-safe">
           <div className="flex w-full justify-around text-xs text-gray-500">
             <span>Scores</span>
             <span>Favorites</span>
             <span>News</span>
           </div>
        </nav>
      </main>
    </div>
  );
}