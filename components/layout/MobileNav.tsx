"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { Clock, Search, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentView = searchParams.get("view");

  const isFavorites = currentView === "favorites";

  // Treat all sports + match pages as "Matches" section (so highlight is correct)
  const isMatchesSection =
    (!isFavorites && pathname === "/") ||
    pathname.startsWith("/sports") ||
    pathname.startsWith("/match");

  // Keep user on current sports tab if already on /sports/*, otherwise go to default feed route
  const matchesHref = pathname.startsWith("/sports") ? pathname : "/sports/football/all";

  const navItems = [
    {
      label: "Matches",
      icon: Clock,
      href: matchesHref,
      isActive: isMatchesSection,
    },
    {
      label: "Search",
      icon: Search,
      href: "#",
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
      href: "#",
      isActive: false,
    },
  ];

  return (
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
                : "text-secondary hover:text-primary"
            )}
          >
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
