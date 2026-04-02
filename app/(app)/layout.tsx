"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { MobileNav } from "@/components/shared/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />

      {/* Main content area */}
      <main className="lg:pl-64">
        {/* Spacer for mobile top bar */}
        <div className="h-14 lg:hidden" />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
        {/* Spacer for mobile bottom nav */}
        <div className="h-16 lg:hidden" />
      </main>
    </div>
  );
}
