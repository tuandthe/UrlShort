"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { NAVBAR_TEXT } from "@/features/dashboard/constants/navbar.constants";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center space-y-4 min-h-100">
      <h2 className="text-xl font-semibold">{NAVBAR_TEXT.dashboardErrorTitle}</h2>
      <Button onClick={() => reset()} variant="outline">{NAVBAR_TEXT.dashboardErrorRetry}</Button>
    </div>
  );
}
