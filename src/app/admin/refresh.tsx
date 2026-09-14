"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AdminRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (window.document.visibilityState === "visible") router.refresh();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [router]);
  return <button type="button" className="admin-refresh" onClick={() => router.refresh()}>Refresh now</button>;
}
