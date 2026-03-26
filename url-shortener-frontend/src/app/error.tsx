"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/constants/routes";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-linear-to-br from-background via-muted/40 to-background px-4">
      <div className="max-w-md space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Đã xảy ra lỗi</h2>
        <p className="text-sm text-muted-foreground">
          Đã xảy ra lỗi không mong muốn khi tải trang này. Bạn có thể thử lại hoặc quay về bảng điều khiển.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()} className="transition-all duration-200">
            Thử lại
          </Button>
          <Button asChild variant="outline" className="transition-all duration-200">
            <Link href={ROUTES.DASHBOARD}>Về bảng điều khiển</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
