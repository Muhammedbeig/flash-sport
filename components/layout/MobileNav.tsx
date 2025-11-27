"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Clock, Search, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentView = searchParams.get("view");
  
  // Logic to determine active tab
  const isFavorites = currentView === "favorites";
  const isHome = pathname === "/" && !currentView;

  const navItems = [
    {
      label: "Matches",
      icon: Clock,
      href: "/", // Resets to home
      isActive: isHome,
    },
    {
      label: "Search",
      icon: Search,
      href: "#", // Placeholder
      isActive: false,
    },
    {
      label: "Favourites",
      icon: Star,
      href: "/?view=favorites",
      isActive: isFavorites,
    },
    {
      label: "Profile",
      icon: User,
      href: "#", // Placeholder
      isActive: false,
    },
  ];

  return (
    // FIX: Replaced explicit 'bg-white dark:bg-slate-900' with 'theme-bg'
    // This ensures it uses the exact same variables as the Header and Sidebar.
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 theme-bg border-t theme-border h-16 pb-safe transition-colors duration-200">
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors relative",
              item.isActive 
                ? "text-blue-600 dark:text-blue-500" 
                // FIX: Use 'text-secondary' for inactive state to match global theme variables
                : "text-secondary hover:text-primary"
            )}
          >
            {/* Active Indicator Line */}
            {item.isActive && (
              <span className="absolute top-0 w-8 h-0.5 bg-blue-600 rounded-b-md" />
            )}
            
            <item.icon 
              size={20} 
              className={item.isActive ? "fill-current" : ""} 
              strokeWidth={item.isActive ? 2.5 : 2}
            />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}