"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Bookmark, User, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const mobileNavItems = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
  { href: "/group", label: "Group", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar } = useUIStore();

  return (
    <>
      {/* Top bar with hamburger on mobile */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b border-border bg-card/80 backdrop-blur-md px-4 lg:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-muted-foreground hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="ml-3 flex items-center gap-2">
          <span className="font-bold">
            <span className="text-primary">Cine</span>
            <span className="text-foreground">Match</span>
          </span>
        </div>
      </header>

      {/* Bottom navigation on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around">
          {mobileNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
