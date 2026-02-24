"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { signOut } from "@/src/actions/auth";
import type { ReactNode } from "react";

export default function AppNav({ rightSlot }: { rightSlot?: ReactNode }) {
  return (
    <nav className="flex items-center justify-between px-6 py-5">
      <Link href="/home" className="font-display font-bold text-xl">
        Moment
      </Link>
      <div className="flex items-center gap-3">
        {rightSlot ?? (
          <>
            <Link
              href="/history"
              className="bg-secondary rounded-full px-4 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
            >
              History
            </Link>
            <ThemeToggle />
            <button
              onClick={() => signOut()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
