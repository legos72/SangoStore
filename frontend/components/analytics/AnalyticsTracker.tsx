"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/** Mounted once in the root layout — tracks every route change automatically. */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const prev     = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === prev.current) return;
    prev.current = pathname;
    // Small delay so the page title is set before we track
    const t = setTimeout(() => trackPageView(pathname), 100);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
